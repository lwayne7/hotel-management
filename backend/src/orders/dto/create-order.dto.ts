import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsDateString, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateOrderDto {
  @ApiProperty({ description: '酒店ID', example: 1 })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  hotelId: number;

  @ApiProperty({ description: '房型ID', example: 101 })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  roomTypeId: number;

  @ApiProperty({ description: '入住日期（YYYY-MM-DD）', example: '2026-03-10' })
  @IsNotEmpty()
  @IsDateString()
  checkInDate: string;

  @ApiProperty({
    description: '离店日期（YYYY-MM-DD，需大于入住日期）',
    example: '2026-03-12',
  })
  @IsNotEmpty()
  @IsDateString()
  checkOutDate: string;

  @ApiProperty({ description: '预订间数', example: 1 })
  @Transform(({ value }) => Math.round(Number(value)))
  @IsInt()
  @Min(1)
  rooms: number;

  @ApiProperty({ description: '入住人数', example: 2 })
  @Transform(({ value }) => Math.round(Number(value)))
  @IsInt()
  @Min(1)
  guests: number;
}
