import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hotel, HotelStatus } from './entities/hotel.entity';
import { RoomType } from './entities/room-type.entity';
import { HotelImage } from './entities/hotel-image.entity';
import { CreateHotelDto, UpdateHotelDto } from './dto';

@Injectable()
export class HotelsService {
  constructor(
    @InjectRepository(Hotel)
    private hotelsRepository: Repository<Hotel>,
    @InjectRepository(RoomType)
    private roomTypesRepository: Repository<RoomType>,
    @InjectRepository(HotelImage)
    private hotelImagesRepository: Repository<HotelImage>,
  ) { }

  private static toNumber(value: unknown): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return Number(value);
    return Number.NaN;
  }

  private sortHotelRelations(hotel: Hotel): Hotel {
    if (Array.isArray(hotel.roomTypes)) {
      hotel.roomTypes.sort((a: any, b: any) => {
        const aPrice = HotelsService.toNumber(a?.price);
        const bPrice = HotelsService.toNumber(b?.price);

        if (Number.isNaN(aPrice) && Number.isNaN(bPrice)) return 0;
        if (Number.isNaN(aPrice)) return 1;
        if (Number.isNaN(bPrice)) return -1;
        return aPrice - bPrice;
      });
    }

    if (Array.isArray(hotel.images)) {
      hotel.images.sort((a: any, b: any) => {
        const aOrder = typeof a?.sortOrder === 'number' ? a.sortOrder : Number(a?.sortOrder ?? 0);
        const bOrder = typeof b?.sortOrder === 'number' ? b.sortOrder : Number(b?.sortOrder ?? 0);
        return aOrder - bOrder;
      });
    }

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

    const total = await query.getCount();
    const data = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    data.forEach((hotel) => this.sortHotelRelations(hotel));

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

    return this.sortHotelRelations(hotel);
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

    return this.sortHotelRelations(hotel);
  }

  // 更新酒店
  async update(
    id: number,
    updateHotelDto: UpdateHotelDto,
    merchantId: number,
  ): Promise<Hotel> {
    const hotel = await this.findOne(id);

    // 验证所有权
    if (hotel.merchantId !== merchantId) {
      throw new ForbiddenException('无权修改此酒店');
    }

    // 只有草稿或被驳回的酒店可以修改
    if (![HotelStatus.DRAFT, HotelStatus.REJECTED].includes(hotel.status)) {
      throw new ForbiddenException('当前状态不允许修改');
    }

    const { roomTypes, images, ...hotelData } = updateHotelDto;

    // 更新酒店基本信息
    Object.assign(hotel, hotelData);
    await this.hotelsRepository.save(hotel);

    // 更新房型（删除旧的，创建新的）
    if (roomTypes !== undefined) {
      await this.roomTypesRepository.delete({ hotelId: id });
      if (roomTypes.length > 0) {
        const roomTypeEntities = roomTypes.map((rt) =>
          this.roomTypesRepository.create({ ...rt, hotelId: id }),
        );
        await this.roomTypesRepository.save(roomTypeEntities);
      }
    }

    // 更新图片（删除旧的，创建新的）
    if (images !== undefined) {
      await this.hotelImagesRepository.delete({ hotelId: id });
      if (images.length > 0) {
        const imageEntities = images.map((img, index) =>
          this.hotelImagesRepository.create({
            ...img,
            hotelId: id,
            sortOrder: img.sortOrder ?? index,
          }),
        );
        await this.hotelImagesRepository.save(imageEntities);
      }
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

    hotel.status = HotelStatus.PENDING;
    hotel.rejectReason = null;
    const saved = await this.hotelsRepository.save(hotel);
    return this.sortHotelRelations(saved);
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
      this.sortHotelRelations(hotel);
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
    return this.sortHotelRelations(saved);
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
    return this.sortHotelRelations(saved);
  }

  // 下线
  async offline(id: number): Promise<Hotel> {
    const hotel = await this.findOne(id);

    if (hotel.status !== HotelStatus.APPROVED) {
      throw new ForbiddenException('只有已发布的酒店可以下线');
    }

    hotel.status = HotelStatus.OFFLINE;
    const saved = await this.hotelsRepository.save(hotel);
    return this.sortHotelRelations(saved);
  }

  // 上线（恢复）
  async online(id: number): Promise<Hotel> {
    const hotel = await this.findOne(id);

    if (hotel.status !== HotelStatus.OFFLINE) {
      throw new ForbiddenException('只有已下线的酒店可以恢复上线');
    }

    hotel.status = HotelStatus.APPROVED;
    const saved = await this.hotelsRepository.save(hotel);
    return this.sortHotelRelations(saved);
  }

  // 商户统计数据
  async getMerchantStatistics(merchantId: number) {
    const total = await this.hotelsRepository.count({
      where: { merchantId },
    });

    const pending = await this.hotelsRepository.count({
      where: { merchantId, status: HotelStatus.PENDING },
    });

    const approved = await this.hotelsRepository.count({
      where: { merchantId, status: HotelStatus.APPROVED },
    });

    const rejected = await this.hotelsRepository.count({
      where: { merchantId, status: HotelStatus.REJECTED },
    });

    const draft = await this.hotelsRepository.count({
      where: { merchantId, status: HotelStatus.DRAFT },
    });

    return { total, pending, approved, rejected, draft };
  }

  // 管理员统计数据
  async getAdminStatistics() {
    const total = await this.hotelsRepository.count();

    const pending = await this.hotelsRepository.count({
      where: { status: HotelStatus.PENDING },
    });

    const approved = await this.hotelsRepository.count({
      where: { status: HotelStatus.APPROVED },
    });

    const rejected = await this.hotelsRepository.count({
      where: { status: HotelStatus.REJECTED },
    });

    const offline = await this.hotelsRepository.count({
      where: { status: HotelStatus.OFFLINE },
    });

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
      query.andWhere('hotel.address LIKE :city', {
        city: `%${filters.city.trim()}%`,
      });
    }
    if (filters?.starRating != null && filters.starRating > 0) {
      query.andWhere('hotel.starRating >= :starRating', {
        starRating: filters.starRating,
      });
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

    data.forEach((hotel) => this.sortHotelRelations(hotel));

    return {
      data,
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

    return this.sortHotelRelations(hotel);
  }
}
