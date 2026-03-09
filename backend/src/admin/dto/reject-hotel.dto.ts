import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectHotelDto {
  @ApiProperty({
    description: '驳回原因',
    example: '酒店地址不完整，请补充详细门牌号',
  })
  @IsString()
  @IsNotEmpty({ message: '驳回原因不能为空' })
  @MaxLength(500, { message: '驳回原因最多500个字符' })
  reason: string;
}
