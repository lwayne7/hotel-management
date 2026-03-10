import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
    @ApiProperty({ description: 'Refresh Token', example: 'eyJhbGciOiJIUzI1NiIs...' })
    @IsString()
    @IsNotEmpty({ message: 'refreshToken 不能为空' })
    refreshToken: string;
}
