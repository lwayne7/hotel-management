import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { HotelsService } from './hotels.service';
import { Hotel, HotelStatus } from './entities/hotel.entity';
import { RoomType } from './entities/room-type.entity';
import { HotelImage } from './entities/hotel-image.entity';
import { User, UserRole } from '../users/entities/user.entity';

// ============ 状态转换矩阵 ============
// 合法转换：
//   DRAFT/REJECTED  → PENDING (submitForReview)
//   PENDING         → APPROVED (approve)
//   PENDING         → REJECTED (reject)
//   APPROVED        → OFFLINE  (offline)
//   OFFLINE         → APPROVED (online)
//   APPROVED/OFFLINE→ PENDING  (update, 自动重审)
//
// 非法转换应全部抛 ForbiddenException

describe('HotelsService (state machine)', () => {
  let ds: DataSource;
  let service: HotelsService;
  let notificationsSent: any[];
  let priceEventsEmitted: any[];

  const MERCHANT_ID = 1;
  const OTHER_MERCHANT_ID = 2;

  // Mock NotificationsGateway
  const mockNotificationsGateway = {
    sendNotification: (payload: any) => {
      notificationsSent.push(payload);
    },
  } as any;

  // Mock PriceUpdatesService
  const mockPriceUpdatesService = {
    emit: (kind: string, hotelId?: number) => {
      priceEventsEmitted.push({ kind, hotelId });
    },
  } as any;

  beforeAll(async () => {
    ds = new DataSource({
      type: 'better-sqlite3',
      database: ':memory:',
      entities: [Hotel, RoomType, HotelImage, User],
      synchronize: true,
      logging: false,
    });
    await ds.initialize();

    service = new HotelsService(
      ds.getRepository(Hotel),
      ds.getRepository(RoomType),
      ds.getRepository(HotelImage),
      ds,
      mockNotificationsGateway,
      mockPriceUpdatesService,
      { reset: jest.fn(), store: { clear: jest.fn() } } as any,
    );

    // 创建测试商户
    await ds.getRepository(User).save([
      {
        id: MERCHANT_ID,
        username: 'merchant1',
        password: 'x',
        role: UserRole.MERCHANT,
      } as any,
      {
        id: OTHER_MERCHANT_ID,
        username: 'merchant2',
        password: 'x',
        role: UserRole.MERCHANT,
      } as any,
    ]);
  });

  beforeEach(() => {
    notificationsSent = [];
    priceEventsEmitted = [];
  });

  afterAll(async () => {
    if (ds?.isInitialized) await ds.destroy();
  });

  // ============ 辅助函数 ============
  async function createHotelInStatus(
    status: HotelStatus,
    merchantId = MERCHANT_ID,
  ): Promise<Hotel> {
    const hotel = ds.getRepository(Hotel).create({
      nameCn: `测试酒店-${Date.now()}`,
      nameEn: 'Test Hotel',
      address: '北京市朝阳区测试路1号',
      starRating: 4,
      openingDate: new Date('2020-01-01'),
      description: '测试用酒店',
      facilities: ['WiFi', '停车场'],
      nearbyAttractions: [],
      transportation: [],
      status,
      rejectReason: status === HotelStatus.REJECTED ? '信息不完整' : null,
      merchantId,
    });
    const saved = await ds.getRepository(Hotel).save(hotel);

    // 添加房型（提交审核需要）
    await ds.getRepository(RoomType).save({
      name: '标准大床房',
      price: 399,
      originalPrice: 499,
      discountType: 'percentage',
      discountValue: 20,
      maxGuests: 2,
      bedType: '1.8m大床',
      roomSize: 30,
      hotelId: saved.id,
    } as any);

    return saved;
  }

  // ============ 1. 创建酒店 ============
  describe('create', () => {
    it('should create hotel in DRAFT status', async () => {
      const hotel = await service.create(
        {
          nameCn: '新建酒店',
          nameEn: 'New Hotel',
          address: '上海市浦东新区',
          starRating: 5,
          openingDate: new Date('2023-06-01') as any,
          roomTypes: [
            {
              name: '豪华大床房',
              price: 888,
              maxGuests: 2,
              bedType: '2.0m大床',
            },
          ],
          images: [
            { imageUrl: 'https://example.com/img.jpg', description: '外观' },
          ],
        } as any,
        MERCHANT_ID,
      );
      expect(hotel.status).toBe(HotelStatus.DRAFT);
      expect(hotel.merchantId).toBe(MERCHANT_ID);
    });
  });

  // ============ 2. 提交审核：合法转换 ============
  describe('submitForReview (DRAFT/REJECTED → PENDING)', () => {
    it('should allow DRAFT → PENDING', async () => {
      const hotel = await createHotelInStatus(HotelStatus.DRAFT);
      const result = await service.submitForReview(hotel.id, MERCHANT_ID);
      expect(result.status).toBe(HotelStatus.PENDING);
      expect(result.rejectReason).toBeNull();
      expect(notificationsSent).toHaveLength(1);
      expect(notificationsSent[0].type).toBe('hotel_submitted');
      expect(notificationsSent[0].targetRole).toBe('admin');
    });

    it('should allow REJECTED → PENDING', async () => {
      const hotel = await createHotelInStatus(HotelStatus.REJECTED);
      const result = await service.submitForReview(hotel.id, MERCHANT_ID);
      expect(result.status).toBe(HotelStatus.PENDING);
      expect(result.rejectReason).toBeNull();
    });

    it('should reject submit without room types', async () => {
      const hotel = ds.getRepository(Hotel).create({
        nameCn: '无房型酒店',
        address: '地址',
        starRating: 3,
        openingDate: new Date('2020-01-01'),
        status: HotelStatus.DRAFT,
        merchantId: MERCHANT_ID,
      });
      const saved = await ds.getRepository(Hotel).save(hotel);
      await expect(
        service.submitForReview(saved.id, MERCHANT_ID),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject submit without openingDate', async () => {
      const hotel = ds.getRepository(Hotel).create({
        nameCn: '无日期酒店',
        address: '地址',
        starRating: 3,
        status: HotelStatus.DRAFT,
        merchantId: MERCHANT_ID,
      });
      const saved = await ds.getRepository(Hotel).save(hotel);
      await ds.getRepository(RoomType).save({
        name: '房间',
        price: 100,
        maxGuests: 2,
        hotelId: saved.id,
      } as any);
      await expect(
        service.submitForReview(saved.id, MERCHANT_ID),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ============ 3. 提交审核：非法转换 ============
  describe('submitForReview (illegal transitions)', () => {
    it.each([HotelStatus.PENDING, HotelStatus.APPROVED, HotelStatus.OFFLINE])(
      'should reject submit from %s status',
      async (status) => {
        const hotel = await createHotelInStatus(status);
        await expect(
          service.submitForReview(hotel.id, MERCHANT_ID),
        ).rejects.toThrow(ForbiddenException);
      },
    );
  });

  // ============ 4. 审核通过：合法转换 ============
  describe('approve (PENDING → APPROVED)', () => {
    it('should allow PENDING → APPROVED', async () => {
      const hotel = await createHotelInStatus(HotelStatus.PENDING);
      const result = await service.approve(hotel.id);
      expect(result.status).toBe(HotelStatus.APPROVED);
      // 应该通知商户
      expect(notificationsSent).toHaveLength(1);
      expect(notificationsSent[0].type).toBe('hotel_approved');
      expect(notificationsSent[0].targetUserId).toBe(MERCHANT_ID);
      // 应该发布 SSE 事件
      expect(priceEventsEmitted).toHaveLength(1);
      expect(priceEventsEmitted[0].kind).toBe('hotel_online');
    });
  });

  // ============ 5. 审核通过：非法转换 ============
  describe('approve (illegal transitions)', () => {
    it.each([
      HotelStatus.DRAFT,
      HotelStatus.APPROVED,
      HotelStatus.REJECTED,
      HotelStatus.OFFLINE,
    ])('should reject approve from %s status', async (status) => {
      const hotel = await createHotelInStatus(status);
      await expect(service.approve(hotel.id)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // ============ 6. 审核驳回：合法转换 ============
  describe('reject (PENDING → REJECTED)', () => {
    it('should allow PENDING → REJECTED with reason', async () => {
      const hotel = await createHotelInStatus(HotelStatus.PENDING);
      const result = await service.reject(hotel.id, '图片不清晰');
      expect(result.status).toBe(HotelStatus.REJECTED);
      expect(result.rejectReason).toBe('图片不清晰');
      // 应该通知商户
      expect(notificationsSent).toHaveLength(1);
      expect(notificationsSent[0].type).toBe('hotel_rejected');
      expect(notificationsSent[0].targetUserId).toBe(MERCHANT_ID);
    });
  });

  // ============ 7. 审核驳回：非法转换 ============
  describe('reject (illegal transitions)', () => {
    it.each([
      HotelStatus.DRAFT,
      HotelStatus.APPROVED,
      HotelStatus.REJECTED,
      HotelStatus.OFFLINE,
    ])('should reject rejecting from %s status', async (status) => {
      const hotel = await createHotelInStatus(status);
      await expect(service.reject(hotel.id, '理由')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // ============ 8. 下线：合法转换 ============
  describe('offline (APPROVED → OFFLINE)', () => {
    it('should allow APPROVED → OFFLINE', async () => {
      const hotel = await createHotelInStatus(HotelStatus.APPROVED);
      const result = await service.offline(hotel.id);
      expect(result.status).toBe(HotelStatus.OFFLINE);
      // 应该通知商户
      expect(notificationsSent).toHaveLength(1);
      expect(notificationsSent[0].type).toBe('hotel_offline');
      // 应该发布 SSE 事件
      expect(priceEventsEmitted).toHaveLength(1);
      expect(priceEventsEmitted[0].kind).toBe('hotel_offline');
    });
  });

  // ============ 9. 下线：非法转换 ============
  describe('offline (illegal transitions)', () => {
    it.each([
      HotelStatus.DRAFT,
      HotelStatus.PENDING,
      HotelStatus.REJECTED,
      HotelStatus.OFFLINE,
    ])('should reject offline from %s status', async (status) => {
      const hotel = await createHotelInStatus(status);
      await expect(service.offline(hotel.id)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // ============ 10. 上线恢复：合法转换 ============
  describe('online (OFFLINE → APPROVED)', () => {
    it('should allow OFFLINE → APPROVED', async () => {
      const hotel = await createHotelInStatus(HotelStatus.OFFLINE);
      const result = await service.online(hotel.id);
      expect(result.status).toBe(HotelStatus.APPROVED);
      expect(notificationsSent).toHaveLength(1);
      expect(notificationsSent[0].type).toBe('hotel_online');
      expect(priceEventsEmitted).toHaveLength(1);
      expect(priceEventsEmitted[0].kind).toBe('hotel_online');
    });
  });

  // ============ 11. 上线恢复：非法转换 ============
  describe('online (illegal transitions)', () => {
    it.each([
      HotelStatus.DRAFT,
      HotelStatus.PENDING,
      HotelStatus.APPROVED,
      HotelStatus.REJECTED,
    ])('should reject online from %s status', async (status) => {
      const hotel = await createHotelInStatus(status);
      await expect(service.online(hotel.id)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // ============ 12. 编辑已发布酒店触发重审 ============
  describe('update (auto re-review)', () => {
    it('should change APPROVED → PENDING on update', async () => {
      const hotel = await createHotelInStatus(HotelStatus.APPROVED);
      const result = await service.update(
        hotel.id,
        { nameCn: '修改后的酒店名' } as any,
        MERCHANT_ID,
      );
      expect(result.status).toBe(HotelStatus.PENDING);
      // 应该通知管理员
      expect(
        notificationsSent.some(
          (n) => n.type === 'hotel_submitted' && n.targetRole === 'admin',
        ),
      ).toBe(true);
    });

    it('should change OFFLINE → PENDING on update', async () => {
      const hotel = await createHotelInStatus(HotelStatus.OFFLINE);
      const result = await service.update(
        hotel.id,
        { nameCn: '修改名称' } as any,
        MERCHANT_ID,
      );
      expect(result.status).toBe(HotelStatus.PENDING);
    });

    it('should keep DRAFT status on update', async () => {
      const hotel = await createHotelInStatus(HotelStatus.DRAFT);
      const result = await service.update(
        hotel.id,
        { nameCn: '草稿修改' } as any,
        MERCHANT_ID,
      );
      expect(result.status).toBe(HotelStatus.DRAFT);
    });
  });

  // ============ 13. 编辑限制 ============
  describe('update (restrictions)', () => {
    it('should reject update on PENDING status', async () => {
      const hotel = await createHotelInStatus(HotelStatus.PENDING);
      await expect(
        service.update(hotel.id, { nameCn: '试图修改' } as any, MERCHANT_ID),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ============ 14. 数据隔离（merchantId 校验） ============
  describe('ownership isolation', () => {
    it('should reject update by non-owner', async () => {
      const hotel = await createHotelInStatus(HotelStatus.DRAFT, MERCHANT_ID);
      await expect(
        service.update(
          hotel.id,
          { nameCn: '被其他人修改' } as any,
          OTHER_MERCHANT_ID,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject submit by non-owner', async () => {
      const hotel = await createHotelInStatus(HotelStatus.DRAFT, MERCHANT_ID);
      await expect(
        service.submitForReview(hotel.id, OTHER_MERCHANT_ID),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject delete by non-owner', async () => {
      const hotel = await createHotelInStatus(HotelStatus.DRAFT, MERCHANT_ID);
      await expect(service.remove(hotel.id, OTHER_MERCHANT_ID)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // ============ 15. 删除限制 ============
  describe('remove', () => {
    it('should allow deleting DRAFT hotels', async () => {
      const hotel = await createHotelInStatus(HotelStatus.DRAFT);
      await expect(
        service.remove(hotel.id, MERCHANT_ID),
      ).resolves.toBeUndefined();
    });

    it.each([
      HotelStatus.PENDING,
      HotelStatus.APPROVED,
      HotelStatus.REJECTED,
      HotelStatus.OFFLINE,
    ])('should reject deleting %s hotels', async (status) => {
      const hotel = await createHotelInStatus(status);
      await expect(service.remove(hotel.id, MERCHANT_ID)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // ============ 16. 公开端只返回已发布酒店 ============
  describe('public queries', () => {
    it('findOneApproved should return APPROVED hotel', async () => {
      const hotel = await createHotelInStatus(HotelStatus.APPROVED);
      const result = await service.findOneApproved(hotel.id);
      expect(result.id).toBe(hotel.id);
      expect(result.status).toBe(HotelStatus.APPROVED);
    });

    it('findOneApproved should throw for non-APPROVED hotel', async () => {
      const hotel = await createHotelInStatus(HotelStatus.DRAFT);
      await expect(service.findOneApproved(hotel.id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('findApprovedHotels should only return APPROVED hotels', async () => {
      // 创建各个状态的酒店
      const draftHotel = await createHotelInStatus(HotelStatus.DRAFT);
      const pendingHotel = await createHotelInStatus(HotelStatus.PENDING);
      const approvedHotel = await createHotelInStatus(HotelStatus.APPROVED);
      const rejectedHotel = await createHotelInStatus(HotelStatus.REJECTED);
      const offlineHotel = await createHotelInStatus(HotelStatus.OFFLINE);

      const result = await service.findApprovedHotels(1, 1000);
      const returnedIds = result.data.map((h) => h.id);
      // 已发布的必须出现
      expect(returnedIds).toContain(approvedHotel.id);
      // 非已发布状态的不应出现
      expect(returnedIds).not.toContain(draftHotel.id);
      expect(returnedIds).not.toContain(pendingHotel.id);
      expect(returnedIds).not.toContain(rejectedHotel.id);
      expect(returnedIds).not.toContain(offlineHotel.id);
      // 所有结果均为 APPROVED
      expect(result.data.every((h) => h.status === HotelStatus.APPROVED)).toBe(
        true,
      );
    });
  });

  // ============ 17. 通知整合验证 ============
  describe('notification integration', () => {
    it('should send admin broadcast on submit', async () => {
      const hotel = await createHotelInStatus(HotelStatus.DRAFT);
      await service.submitForReview(hotel.id, MERCHANT_ID);
      const notification = notificationsSent.find(
        (n) => n.type === 'hotel_submitted',
      );
      expect(notification).toBeDefined();
      expect(notification.targetRole).toBe('admin');
      expect(notification.hotelName).toBe(hotel.nameCn);
    });

    it('should send precise user notification on approve', async () => {
      const hotel = await createHotelInStatus(HotelStatus.PENDING);
      await service.approve(hotel.id);
      const notification = notificationsSent.find(
        (n) => n.type === 'hotel_approved',
      );
      expect(notification.targetUserId).toBe(MERCHANT_ID);
    });

    it('should send precise user notification on reject', async () => {
      const hotel = await createHotelInStatus(HotelStatus.PENDING);
      await service.reject(hotel.id, '不符合标准');
      const notification = notificationsSent.find(
        (n) => n.type === 'hotel_rejected',
      );
      expect(notification.targetUserId).toBe(MERCHANT_ID);
      expect(notification.message).toContain('不符合标准');
    });
  });

  // ============ 18. SSE 事件验证 ============
  describe('SSE price events', () => {
    it('should emit hotel_online on approve', async () => {
      const hotel = await createHotelInStatus(HotelStatus.PENDING);
      await service.approve(hotel.id);
      expect(
        priceEventsEmitted.some(
          (e) => e.kind === 'hotel_online' && e.hotelId === hotel.id,
        ),
      ).toBe(true);
    });

    it('should emit hotel_offline on offline', async () => {
      const hotel = await createHotelInStatus(HotelStatus.APPROVED);
      await service.offline(hotel.id);
      expect(
        priceEventsEmitted.some(
          (e) => e.kind === 'hotel_offline' && e.hotelId === hotel.id,
        ),
      ).toBe(true);
    });

    it('should emit hotel_online on restore', async () => {
      const hotel = await createHotelInStatus(HotelStatus.OFFLINE);
      await service.online(hotel.id);
      expect(
        priceEventsEmitted.some(
          (e) => e.kind === 'hotel_online' && e.hotelId === hotel.id,
        ),
      ).toBe(true);
    });
  });
});
