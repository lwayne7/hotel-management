import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  Min,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class PaymentCallbackDto {
  @ApiProperty({
    description: '幂等事件ID（第三方回调唯一标识）',
    example: 'evt_20260309_000001',
  })
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @ApiProperty({ description: '订单ID', example: 1 })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  orderId: number;

  @ApiPropertyOptional({ description: '支付流水号', example: 'pay_000001' })
  @IsOptional()
  @IsString()
  paymentNo?: string;

  @ApiPropertyOptional({
    description: '支付时间（ISO）',
    example: '2026-03-09T12:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  paidAt?: string;
}
