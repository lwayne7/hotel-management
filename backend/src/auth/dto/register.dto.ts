import { IsString, IsNotEmpty, MinLength, MaxLength, IsEnum, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../users/entities/user.entity';

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

  @ApiProperty({ description: '用户角色', enum: UserRole, example: UserRole.MERCHANT })
  @IsEnum(UserRole, { message: '角色必须是 merchant 或 admin' })
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
