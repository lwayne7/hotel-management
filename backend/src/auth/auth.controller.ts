import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto';
import { CurrentUser } from './decorators';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60_000 } }) // 注册：每 IP 每分钟最多 3 次
  @ApiOperation({ summary: '用户注册' })
  @ApiResponse({ status: 201, description: '注册成功' })
  @ApiResponse({ status: 409, description: '用户名已存在' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60_000 } }) // 登录：每 IP 每分钟最多 5 次（防暴力破解）
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '用户登录' })
  @ApiResponse({ status: 200, description: '登录成功，返回 access_token + refresh_token' })
  @ApiResponse({ status: 401, description: '用户名或密码错误' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @Throttle({ default: { limit: 10, ttl: 60_000 } }) // refresh：每 IP 每分钟最多 10 次
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '刷新 Token（使用 refresh_token 换取新 token 对）' })
  @ApiResponse({ status: 200, description: '刷新成功，返回新的 access_token + refresh_token' })
  @ApiResponse({ status: 401, description: 'refresh_token 无效或已过期' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: '登出（递增 tokenVersion，吊销所有旧 refresh_token）' })
  @ApiResponse({ status: 204, description: '登出成功' })
  async logout(@CurrentUser() user: { id: number }) {
    await this.authService.logout(user.id);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  async profile(@CurrentUser() user: { id: number }) {
    return this.authService.validateUser(user.id);
  }
}
