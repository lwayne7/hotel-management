import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsArray,
  IsDateString,
  IsEnum,
  Min,
  Max,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType } from '../entities/room-type.entity';

class CreateRoomTypeDto {
  @ApiProperty({ description: '房型名称', example: '豪华大床房' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty({ description: '房间价格', example: 399 })
  @IsInt()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ description: '原价', example: 499 })
  @IsOptional()
  @IsInt()
  @Min(0)
  originalPrice?: number;

  @ApiPropertyOptional({ description: '折扣类型', enum: DiscountType, example: DiscountType.PERCENTAGE })
  @IsOptional()
  @IsEnum(DiscountType)
  discountType?: DiscountType;

  @ApiPropertyOptional({ description: '折扣值', example: 80 })
  @IsOptional()
  discountValue?: number;

  @ApiPropertyOptional({ description: '折扣描述', example: '限时8折' })
  @IsOptional()
  @IsString()
  discountDescription?: string;

  @ApiPropertyOptional({ description: '最大入住人数', example: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxGuests?: number;

  @ApiPropertyOptional({ description: '床型', example: '1.8m大床' })
  @IsOptional()
  @IsString()
  bedType?: string;

  @ApiPropertyOptional({ description: '房间面积(平方米)', example: 35 })
  @IsOptional()
  @IsInt()
  roomSize?: number;

  @ApiPropertyOptional({ description: '房间设施', example: ['WiFi', '空调', '电视'] })
  @IsOptional()
  @IsArray()
  amenities?: string[];
}

class CreateHotelImageDto {
  @ApiProperty({ description: '图片URL' })
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @ApiPropertyOptional({ description: '排序', example: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({ description: '图片描述' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateHotelDto {
  @ApiProperty({ description: '酒店中文名', example: '北京希尔顿酒店' })
  @IsString()
  @IsNotEmpty({ message: '酒店名称不能为空' })
  @MaxLength(100)
  nameCn: string;

  @ApiPropertyOptional({ description: '酒店英文名', example: 'Beijing Hilton Hotel' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nameEn?: string;

  @ApiProperty({ description: '酒店地址', example: '北京市朝阳区东三环北路8号' })
  @IsString()
  @IsNotEmpty({ message: '酒店地址不能为空' })
  @MaxLength(255)
  address: string;

  @ApiProperty({ description: '酒店星级(1-5)', example: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  starRating: number;

  @ApiPropertyOptional({ description: '开业时间', example: '2020-01-01' })
  @IsOptional()
  @IsDateString()
  openingDate?: string;

  @ApiPropertyOptional({ description: '酒店描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '酒店设施', example: ['游泳池', '健身房', '停车场'] })
  @IsOptional()
  @IsArray()
  facilities?: string[];

  @ApiPropertyOptional({ description: '附近景点', example: ['故宫', '天安门'] })
  @IsOptional()
  @IsArray()
  nearbyAttractions?: string[];

  @ApiPropertyOptional({ description: '交通信息', example: ['地铁10号线', '机场大巴'] })
  @IsOptional()
  @IsArray()
  transportation?: string[];

  @ApiPropertyOptional({ description: '房型列表', type: [CreateRoomTypeDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRoomTypeDto)
  roomTypes?: CreateRoomTypeDto[];

  @ApiPropertyOptional({ description: '酒店图片', type: [CreateHotelImageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateHotelImageDto)
  images?: CreateHotelImageDto[];
}
