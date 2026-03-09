import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsIn,
  IsOptional,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../users/entities/user.entity';

/**
 * 允许自助注册的角色白名单。
 * admin 角色只能通过 seed 脚本或超级管理员后台创建，禁止通过注册接口自选。
 */
const ALLOWED_REGISTER_ROLES = [UserRole.MERCHANT, UserRole.CUSTOMER] as const;

export class RegisterDto {
  @ApiProperty({ description: '用户名', example: 'merchant001' })
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  @MinLength(6, { message: '用户名至少6个字符' })
  @MaxLength(20, { message: '用户名最多20个字符' })
  username: string;

  @ApiProperty({ description: '密码', example: 'password123' })
  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(8, { message: '密码至少8个字符' })
  @MaxLength(20, { message: '密码最多20个字符' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]+$/, {
    message: '密码必须包含数字和字母',
  })
  password: string;

  @ApiProperty({
    description: '用户角色（仅允许 merchant / customer）',
    enum: ALLOWED_REGISTER_ROLES,
    example: UserRole.MERCHANT,
  })
  @IsIn(ALLOWED_REGISTER_ROLES, {
    message: '注册角色仅允许 merchant 或 customer',
  })
  role: UserRole;

  @ApiPropertyOptional({ description: '昵称', example: '张三酒店' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nickname?: string;

  @ApiPropertyOptional({ description: '手机号', example: '13800138000' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}
