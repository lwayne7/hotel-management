import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Hotel, HotelStatus } from './entities/hotel.entity';
import { RoomType } from './entities/room-type.entity';
import { HotelImage } from './entities/hotel-image.entity';
import { CreateHotelDto, UpdateHotelDto } from './dto';
import { getPlaceholderImageUrl } from './constants/placeholder-images';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { PriceUpdatesService } from './price-updates.service';

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value);
  return Number.NaN;
}

function sortRoomTypesByPrice(roomTypes: unknown[]): void {
  roomTypes.sort((a: unknown, b: unknown) => {
    const aPrice = toNumber((a as { price?: unknown })?.price);
    const bPrice = toNumber((b as { price?: unknown })?.price);
    if (Number.isNaN(aPrice) && Number.isNaN(bPrice)) return 0;
    if (Number.isNaN(aPrice)) return 1;
    if (Number.isNaN(bPrice)) return -1;
    return aPrice - bPrice;
  });
}

function sortImagesByOrder(images: unknown[]): void {
  images.sort((a: unknown, b: unknown) => {
    const aOrder = typeof (a as { sortOrder?: number })?.sortOrder === 'number'
      ? (a as { sortOrder: number }).sortOrder
      : Number((a as { sortOrder?: unknown })?.sortOrder ?? 0);
    const bOrder = typeof (b as { sortOrder?: number })?.sortOrder === 'number'
      ? (b as { sortOrder: number }).sortOrder
      : Number((b as { sortOrder?: unknown })?.sortOrder ?? 0);
    return aOrder - bOrder;
  });
}

const ACCOMMODATION_TYPE_KEYWORDS: Record<string, string[]> = {
  homestay: ['民宿'],
  apartment: ['酒店公寓', '公寓'],
  hostel: ['青年旅馆', '青旅'],
  flat: ['公寓'],
  hourly: ['钟点房', '小时房'],
};

/** 确保酒店有主图：无图时用房型图或占位图，并设置 coverImageUrl */
function ensureCoverImage(hotel: Hotel & { coverImageUrl?: string }): void {
  const hasValidImage = Array.isArray(hotel.images) &&
    hotel.images.some((img: { imageUrl?: string }) => img?.imageUrl?.trim?.());
  if (!hasValidImage && Array.isArray(hotel.roomTypes)) {
    const first = hotel.roomTypes.find((r: { imageUrl?: string }) => r?.imageUrl?.trim?.());
    if (first?.imageUrl?.trim?.()) {
      hotel.images = [{ id: 0, imageUrl: first.imageUrl.trim(), description: '房型', sortOrder: 0 } as HotelImage];
    }
  }
  if (!Array.isArray(hotel.images) || !hotel.images.some((img: { imageUrl?: string }) => img?.imageUrl?.trim?.())) {
    hotel.images = [
      { id: 0, imageUrl: getPlaceholderImageUrl(hotel.id), description: '酒店外观', sortOrder: 0 } as HotelImage,
    ];
  }
  const firstImage = hotel.images?.[0];
  const mainUrl = (firstImage?.imageUrl?.trim?.() ?? '').trim();
  hotel.coverImageUrl = mainUrl || getPlaceholderImageUrl(hotel.id);
}

@Injectable()
export class HotelsService {
  constructor(
    @InjectRepository(Hotel)
    private hotelsRepository: Repository<Hotel>,
    @InjectRepository(RoomType)
    private roomTypesRepository: Repository<RoomType>,
    @InjectRepository(HotelImage)
    private hotelImagesRepository: Repository<HotelImage>,
    private readonly dataSource: DataSource,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly priceUpdatesService: PriceUpdatesService,
  ) {}

  private normalizeHotel(hotel: Hotel): Hotel {
    if (Array.isArray(hotel.roomTypes)) sortRoomTypesByPrice(hotel.roomTypes);
    if (Array.isArray(hotel.images)) sortImagesByOrder(hotel.images);
    ensureCoverImage(hotel as Hotel & { coverImageUrl?: string });
    return hotel;
  }

  // 创建酒店
  async create(createHotelDto: CreateHotelDto, merchantId: number): Promise<Hotel> {
    const { roomTypes, images, ...hotelData } = createHotelDto;

    // 创建酒店
    const hotel = this.hotelsRepository.create({
      ...hotelData,
      merchantId,
      status: HotelStatus.DRAFT,
    });
    const savedHotel = await this.hotelsRepository.save(hotel);

    // 创建房型
    if (roomTypes && roomTypes.length > 0) {
      const roomTypeEntities = roomTypes.map((rt) =>
        this.roomTypesRepository.create({ ...rt, hotelId: savedHotel.id }),
      );
      await this.roomTypesRepository.save(roomTypeEntities);
    }

    // 创建图片
    if (images && images.length > 0) {
      const imageEntities = images.map((img, index) =>
        this.hotelImagesRepository.create({
          ...img,
          hotelId: savedHotel.id,
          sortOrder: img.sortOrder ?? index,
        }),
      );
      await this.hotelImagesRepository.save(imageEntities);
    }

    return this.findOne(savedHotel.id);
  }

  // 获取商户的酒店列表
  async findByMerchant(
    merchantId: number,
    page = 1,
    pageSize = 10,
    status?: HotelStatus,
    keyword?: string,
  ) {
    const query = this.hotelsRepository
      .createQueryBuilder('hotel')
      .leftJoinAndSelect('hotel.roomTypes', 'roomTypes')
      .leftJoinAndSelect('hotel.images', 'images')
      .where('hotel.merchantId = :merchantId', { merchantId })
      .orderBy('hotel.updatedAt', 'DESC');

    if (status) {
      query.andWhere('hotel.status = :status', { status });
    }

    if (keyword?.trim()) {
      query.andWhere(
        '(hotel.nameCn LIKE :keyword OR hotel.nameEn LIKE :keyword OR hotel.address LIKE :keyword)',
        { keyword: `%${keyword.trim()}%` },
      );
    }

    const total = await query.getCount();
    const data = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    data.forEach((hotel) => this.normalizeHotel(hotel));

    return {
      data,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // 获取单个酒店
  async findOne(id: number): Promise<Hotel> {
    const hotel = await this.hotelsRepository.findOne({
      where: { id },
      relations: ['roomTypes', 'images', 'merchant'],
    });

    if (!hotel) {
      throw new NotFoundException('酒店不存在');
    }

    return this.normalizeHotel(hotel);
  }

  // 获取单个酒店（商户，仅可看自己的）
  async findOneForMerchant(id: number, merchantId: number): Promise<Hotel> {
    const hotel = await this.hotelsRepository.findOne({
      where: { id, merchantId },
      relations: ['roomTypes', 'images'],
    });

    if (!hotel) {
      throw new NotFoundException('酒店不存在');
    }

    return this.normalizeHotel(hotel);
  }

  // 更新酒店（事务保护：hotel + roomTypes + images 原子更新）
  async update(
    id: number,
    updateHotelDto: UpdateHotelDto,
    merchantId: number,
  ): Promise<Hotel> {
    const hotel = await this.findOne(id);
    const prevStatus = hotel.status;

    // 验证所有权
    if (hotel.merchantId !== merchantId) {
      throw new ForbiddenException('无权修改此酒店');
    }

    // 待审核状态不允许修改，需等待审核结果
    if (hotel.status === HotelStatus.PENDING) {
      throw new ForbiddenException('酒店正在审核中，暂不允许修改');
    }

    const { roomTypes, images, ...hotelData } = updateHotelDto;

    // 已发布或已下线的酒店编辑后需要重新审核
    const needsReReview = [HotelStatus.APPROVED, HotelStatus.OFFLINE].includes(hotel.status);

    await this.dataSource.transaction(async (manager) => {
      const hotelRepo = manager.getRepository(Hotel);
      const roomTypeRepo = manager.getRepository(RoomType);
      const imageRepo = manager.getRepository(HotelImage);

      // 更新酒店基本信息
      Object.assign(hotel, hotelData);
      if (needsReReview) {
        hotel.status = HotelStatus.PENDING;
        hotel.rejectReason = null;
      }
      await hotelRepo.save(hotel);

      // 更新房型（删除旧的，创建新的）
      if (roomTypes !== undefined) {
        await roomTypeRepo.delete({ hotelId: id });
        if (roomTypes.length > 0) {
          const roomTypeEntities = roomTypes.map((rt) =>
            roomTypeRepo.create({ ...rt, hotelId: id }),
          );
          await roomTypeRepo.save(roomTypeEntities);
        }
      }

      // 更新图片（删除旧的，创建新的）
      if (images !== undefined) {
        await imageRepo.delete({ hotelId: id });
        if (images.length > 0) {
          const imageEntities = images.map((img, index) =>
            imageRepo.create({
              ...img,
              hotelId: id,
              sortOrder: img.sortOrder ?? index,
            }),
          );
          await imageRepo.save(imageEntities);
        }
      }
    });

    // 已发布/已下线酒店编辑后状态自动变为 pending，需通知管理员
    if (needsReReview) {
      this.notificationsGateway.sendNotification({
        type: 'hotel_submitted',
        hotelId: hotel.id,
        hotelName: hotel.nameCn,
        message: `商户重新提交了酒店「${hotel.nameCn}」的审核申请（编辑后重审）`,
        timestamp: Date.now(),
        targetRole: 'admin',
      });
    }

    if (prevStatus === HotelStatus.APPROVED && hotel.status !== HotelStatus.APPROVED) {
      this.priceUpdatesService.emit('hotel_hidden', id);
    } else if (hotel.status === HotelStatus.APPROVED && roomTypes !== undefined) {
      this.priceUpdatesService.emit('price_changed', id);
    } else if (hotel.status === HotelStatus.APPROVED) {
      this.priceUpdatesService.emit('hotel_updated', id);
    }

    return this.findOne(id);
  }

  // 删除酒店
  async remove(id: number, merchantId: number): Promise<void> {
    const hotel = await this.findOne(id);

    if (hotel.merchantId !== merchantId) {
      throw new ForbiddenException('无权删除此酒店');
    }

    // 只有草稿可以删除
    if (hotel.status !== HotelStatus.DRAFT) {
      throw new ForbiddenException('只有草稿状态的酒店可以删除');
    }

    await this.hotelsRepository.remove(hotel);
  }

  // 提交审核
  async submitForReview(id: number, merchantId: number): Promise<Hotel> {
    const hotel = await this.findOne(id);

    if (hotel.merchantId !== merchantId) {
      throw new ForbiddenException('无权操作此酒店');
    }

    if (![HotelStatus.DRAFT, HotelStatus.REJECTED].includes(hotel.status)) {
      throw new ForbiddenException('当前状态不允许提交审核');
    }

    // 验证必填字段
    if (!hotel.roomTypes || hotel.roomTypes.length === 0) {
      throw new ForbiddenException('请至少添加一个房型');
    }
    if (!hotel.openingDate) {
      throw new ForbiddenException('请填写开业时间');
    }

    hotel.status = HotelStatus.PENDING;
    hotel.rejectReason = null;
    const saved = await this.hotelsRepository.save(hotel);
    this.notificationsGateway.sendNotification({
      type: 'hotel_submitted',
      hotelId: saved.id,
      hotelName: saved.nameCn,
      message: `商户提交了酒店「${saved.nameCn}」的审核申请`,
      timestamp: Date.now(),
      targetRole: 'admin',
    });
    return this.normalizeHotel(saved);
  }

  // ========== 管理员接口 ==========

  // 获取待审核/所有酒店列表
  async findAllForAdmin(page = 1, pageSize = 10, status?: HotelStatus) {
    const query = this.hotelsRepository
      .createQueryBuilder('hotel')
      .leftJoinAndSelect('hotel.roomTypes', 'roomTypes')
      .leftJoinAndSelect('hotel.images', 'images')
      .leftJoinAndSelect('hotel.merchant', 'merchant')
      .orderBy('hotel.updatedAt', 'DESC');

    if (status) {
      query.andWhere('hotel.status = :status', { status });
    }

    const total = await query.getCount();
    const data = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    // 移除密码
    data.forEach((hotel) => {
      this.normalizeHotel(hotel);
      if (hotel.merchant) {
        delete (hotel.merchant as any).password;
      }
    });

    return {
      data,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // 审核通过
  async approve(id: number): Promise<Hotel> {
    const hotel = await this.findOne(id);

    if (hotel.status !== HotelStatus.PENDING) {
      throw new ForbiddenException('只有待审核的酒店可以审核');
    }

    hotel.status = HotelStatus.APPROVED;
    hotel.rejectReason = null;
    const saved = await this.hotelsRepository.save(hotel);
    this.notificationsGateway.sendNotification({
      type: 'hotel_approved',
      hotelId: saved.id,
      hotelName: saved.nameCn,
      message: `您的酒店「${saved.nameCn}」已通过审核并发布`,
      timestamp: Date.now(),
      targetUserId: saved.merchantId,
    });
    this.priceUpdatesService.emit('hotel_online', saved.id);
    return this.normalizeHotel(saved);
  }

  // 审核驳回
  async reject(id: number, reason: string): Promise<Hotel> {
    const hotel = await this.findOne(id);

    if (hotel.status !== HotelStatus.PENDING) {
      throw new ForbiddenException('只有待审核的酒店可以驳回');
    }

    hotel.status = HotelStatus.REJECTED;
    hotel.rejectReason = reason;
    const saved = await this.hotelsRepository.save(hotel);
    this.notificationsGateway.sendNotification({
      type: 'hotel_rejected',
      hotelId: saved.id,
      hotelName: saved.nameCn,
      message: `您的酒店「${saved.nameCn}」审核未通过：${reason}`,
      timestamp: Date.now(),
      targetUserId: saved.merchantId,
    });
    return this.normalizeHotel(saved);
  }

  // 下线
  async offline(id: number): Promise<Hotel> {
    const hotel = await this.findOne(id);

    if (hotel.status !== HotelStatus.APPROVED) {
      throw new ForbiddenException('只有已发布的酒店可以下线');
    }

    hotel.status = HotelStatus.OFFLINE;
    const saved = await this.hotelsRepository.save(hotel);
    this.priceUpdatesService.emit('hotel_offline', saved.id);
    this.notificationsGateway.sendNotification({
      type: 'hotel_offline',
      hotelId: saved.id,
      hotelName: saved.nameCn,
      message: `您的酒店「${saved.nameCn}」已被下线`,
      timestamp: Date.now(),
      targetUserId: saved.merchantId,
    });
    return this.normalizeHotel(saved);
  }

  // 上线（恢复）
  async online(id: number): Promise<Hotel> {
    const hotel = await this.findOne(id);

    if (hotel.status !== HotelStatus.OFFLINE) {
      throw new ForbiddenException('只有已下线的酒店可以恢复上线');
    }

    hotel.status = HotelStatus.APPROVED;
    const saved = await this.hotelsRepository.save(hotel);
    this.priceUpdatesService.emit('hotel_online', saved.id);
    this.notificationsGateway.sendNotification({
      type: 'hotel_online',
      hotelId: saved.id,
      hotelName: saved.nameCn,
      message: `您的酒店「${saved.nameCn}」已恢复上线`,
      timestamp: Date.now(),
      targetUserId: saved.merchantId,
    });
    return this.normalizeHotel(saved);
  }

  /** 按状态统计酒店数量（用于商户端与管理员端） */
  private async countByStatus(where: { merchantId?: number } = {}) {
    const [draft, pending, approved, rejected, offline] = await Promise.all([
      this.hotelsRepository.count({ where: { ...where, status: HotelStatus.DRAFT } }),
      this.hotelsRepository.count({ where: { ...where, status: HotelStatus.PENDING } }),
      this.hotelsRepository.count({ where: { ...where, status: HotelStatus.APPROVED } }),
      this.hotelsRepository.count({ where: { ...where, status: HotelStatus.REJECTED } }),
      this.hotelsRepository.count({ where: { ...where, status: HotelStatus.OFFLINE } }),
    ]);
    return { draft, pending, approved, rejected, offline };
  }

  async getMerchantStatistics(merchantId: number) {
    const { draft, pending, approved, rejected, offline } = await this.countByStatus({ merchantId });
    const total = draft + pending + approved + rejected + offline;
    return { total, pending, approved, rejected, draft };
  }

  async getAdminStatistics() {
    const { draft, pending, approved, rejected, offline } = await this.countByStatus();
    const total = draft + pending + approved + rejected + offline;
    return { total, pending, approved, rejected, offline };
  }

  // ========== 用户端公开接口（仅已发布酒店）==========

  async findApprovedHotels(
    page = 1,
    pageSize = 10,
    filters?: {
      keyword?: string;
      city?: string;
      starRating?: number;
      minPrice?: number;
      maxPrice?: number;
      sortBy?: string;
      // 综合筛选参数
      accommodationType?: string[];
      facilities?: string[];
      brands?: string[];
      hotelFeatures?: string[];
      roomFeatures?: string[];
      tags?: string[]; // 热门标签筛选
    },
  ) {
    const query = this.hotelsRepository
      .createQueryBuilder('hotel')
      .leftJoinAndSelect('hotel.roomTypes', 'roomTypes')
      .leftJoinAndSelect('hotel.images', 'images')
      .where('hotel.status = :status', { status: HotelStatus.APPROVED });

    // 默认按更新时间排序，但可以根据 sortBy 参数改变
    if (filters?.sortBy === 'price') {
      // 按价格排序（从低到高）
      query.orderBy('roomTypes.price', 'ASC', 'NULLS LAST').addOrderBy('hotel.updatedAt', 'DESC');
    } else if (filters?.sortBy === 'popular' || filters?.sortBy === 'smart') {
      // 智能排序/按欢迎度排序（使用星级和更新时间）
      query.orderBy('hotel.starRating', 'DESC').addOrderBy('hotel.updatedAt', 'DESC');
    } else if (filters?.sortBy === 'distance') {
      // 按距离排序（暂时使用更新时间，未来可添加GPS定位）
      query.orderBy('hotel.updatedAt', 'DESC');
    } else {
      // 默认按更新时间排序
      query.orderBy('hotel.updatedAt', 'DESC');
    }

    if (filters?.keyword?.trim()) {
      // 搜索酒店名称、地址、描述、设施标签、交通信息和房型名称
      query.andWhere(
        '(hotel.nameCn LIKE :keyword OR hotel.nameEn LIKE :keyword OR hotel.address LIKE :keyword OR hotel.description LIKE :keyword OR hotel.facilities LIKE :keyword OR hotel.transportation LIKE :keyword OR roomTypes.name LIKE :keyword)',
        { keyword: `%${filters.keyword.trim()}%` },
      );
    }
    if (filters?.city?.trim()) {
      const cityPattern = `${filters.city.trim()}%`;
      const cityLike = `%${filters.city.trim()}%`;
      query.andWhere(
        '(hotel.address LIKE :cityLike OR hotel.nameCn LIKE :cityPattern)',
        { cityLike, cityPattern },
      );
    }
    if (filters?.starRating != null && filters.starRating > 0) {
      query.andWhere('hotel.starRating = :starRating', {
        starRating: filters.starRating,
      });
    }

    // 住宿类型筛选：hotel 表示“全部酒店”不额外过滤，其它类型按名称/描述关键字匹配
    if (filters?.accommodationType?.length && !filters.accommodationType.includes('hotel')) {
      const typeConditions: string[] = [];
      let keywordIndex = 0;
      filters.accommodationType.forEach((type) => {
        const keywords = ACCOMMODATION_TYPE_KEYWORDS[type] || [];
        keywords.forEach((keyword) => {
          const paramName = `accommodationType${keywordIndex++}`;
          typeConditions.push(
            `(hotel.nameCn LIKE :${paramName} OR hotel.nameEn LIKE :${paramName} OR hotel.description LIKE :${paramName})`,
          );
          query.setParameter(paramName, `%${keyword}%`);
        });
      });
      if (typeConditions.length > 0) {
        query.andWhere(`(${typeConditions.join(' OR ')})`);
      } else {
        // 传入未知类型时不返回数据，避免“筛选无效果”
        query.andWhere('1 = 0');
      }
    }
    
    // 设施筛选 - 搜索 facilities 字段
    if (filters?.facilities?.length) {
      const facilityConditions = filters.facilities.map((_, i) => `hotel.facilities LIKE :facility${i}`);
      query.andWhere(`(${facilityConditions.join(' OR ')})`);
      filters.facilities.forEach((facility, i) => {
        query.setParameter(`facility${i}`, `%${facility}%`);
      });
    }
    
    // 品牌筛选 - 搜索酒店名称
    if (filters?.brands?.length) {
      const brandConditions = filters.brands.map((_, i) => `hotel.nameCn LIKE :brand${i}`);
      query.andWhere(`(${brandConditions.join(' OR ')})`);
      filters.brands.forEach((brand, i) => {
        query.setParameter(`brand${i}`, `%${brand}%`);
      });
    }
    
    // 酒店特色筛选 - 搜索 description、facilities 和 transportation 字段
    if (filters?.hotelFeatures?.length) {
      const featureConditions = filters.hotelFeatures.map((_, i) => 
        `(hotel.description LIKE :hotelFeature${i} OR hotel.facilities LIKE :hotelFeature${i} OR hotel.transportation LIKE :hotelFeature${i})`
      );
      query.andWhere(`(${featureConditions.join(' OR ')})`);
      filters.hotelFeatures.forEach((feature, i) => {
        query.setParameter(`hotelFeature${i}`, `%${feature}%`);
      });
    }
    
    // 房间特色筛选 - 搜索房型名称
    if (filters?.roomFeatures?.length) {
      const roomConditions = filters.roomFeatures.map((_, i) => `roomTypes.name LIKE :roomFeature${i}`);
      query.andWhere(`(${roomConditions.join(' OR ')})`);
      filters.roomFeatures.forEach((feature, i) => {
        query.setParameter(`roomFeature${i}`, `%${feature}%`);
      });
    }
    
    // 热门标签筛选 - 搜索设施、描述、房型名称和交通信息
    if (filters?.tags?.length) {
      const tagConditions = filters.tags.map((_, i) => 
        `(hotel.facilities LIKE :tag${i} OR hotel.description LIKE :tag${i} OR hotel.transportation LIKE :tag${i} OR roomTypes.name LIKE :tag${i})`
      );
      // 使用 OR，任一标签命中即可，避免过于严格导致“筛不到结果”
      query.andWhere(`(${tagConditions.join(' OR ')})`);
      filters.tags.forEach((tag, i) => {
        query.setParameter(`tag${i}`, `%${tag}%`);
      });
    }
    
    // 价格区间筛选
    if (filters?.minPrice != null && filters.minPrice > 0) {
      const subQuery = this.hotelsRepository.manager
        .createQueryBuilder()
        .select('rt.hotelId', 'hotelId')
        .from('room_types', 'rt')
        .groupBy('rt.hotelId')
        .having('MIN(rt.price) >= :minPrice');
      query.andWhere(`hotel.id IN (${subQuery.getQuery()})`).setParameter('minPrice', filters.minPrice);
    }
    if (filters?.maxPrice != null && filters.maxPrice > 0) {
      const subQuery = this.hotelsRepository.manager
        .createQueryBuilder()
        .select('rt.hotelId', 'hotelId')
        .from('room_types', 'rt')
        .groupBy('rt.hotelId')
        .having('MIN(rt.price) <= :maxPrice');
      query.andWhere(`hotel.id IN (${subQuery.getQuery()})`).setParameter('maxPrice', filters.maxPrice);
    }

    const total = await query.getCount();
    const data = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    data.forEach((hotel) => this.normalizeHotel(hotel));

    // 转为普通对象并显式带上 coverImageUrl，确保序列化后前端一定能拿到主图
    const dataWithCover = data.map((h) => {
      const cover = ((h as any).coverImageUrl as string | undefined)?.trim?.();
      return { ...h, coverImageUrl: cover || getPlaceholderImageUrl(h.id) };
    });

    return {
      data: dataWithCover,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOneApproved(id: number): Promise<Hotel> {
    const hotel = await this.hotelsRepository.findOne({
      where: { id, status: HotelStatus.APPROVED },
      relations: ['roomTypes', 'images'],
    });

    if (!hotel) {
      throw new NotFoundException('酒店不存在或未发布');
    }

    return this.normalizeHotel(hotel);
  }
}
