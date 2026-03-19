import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto } from './dto';
import { User } from '../users/entities/user.entity';

function stripPassword(user: User): Partial<User> {
  const userWithoutPassword = { ...user } as Partial<User> & {
    password?: string;
  };
  delete userWithoutPassword.password;
  return userWithoutPassword;
}

/** access_token 有效期（15 分钟） */
const ACCESS_TOKEN_EXPIRES_IN = '15m';
/** refresh_token 有效期（7 天） */
const REFRESH_TOKEN_EXPIRES_IN = '7d';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * 生成 access_token + refresh_token 双 Token 对。
   * refresh_token payload 携带 version，与 DB 中的 tokenVersion 绑定，
   * 登出时递增 tokenVersion 即可使所有旧 refresh_token 立即失效。
   */
  private generateTokenPair(user: {
    id: number;
    username: string;
    role: string;
    tokenVersion: number;
  }) {
    const payload = { sub: user.id, username: user.username, role: user.role };

    const access_token = this.jwtService.sign(payload, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });
    const refresh_token = this.jwtService.sign(
      { sub: user.id, type: 'refresh', version: user.tokenVersion },
      { expiresIn: REFRESH_TOKEN_EXPIRES_IN },
    );

    return { access_token, refresh_token };
  }

  async register(registerDto: RegisterDto): Promise<{
    user: Partial<User>;
    access_token: string;
    refresh_token: string;
  }> {
    const { username, password, role, nickname, phone } = registerDto;

    // 检查用户名是否已存在
    const exists = await this.usersService.existsByUsername(username);
    if (exists) {
      throw new ConflictException('用户名已存在');
    }

    // 加密密码
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 创建用户
    const user = await this.usersService.create({
      username,
      password: hashedPassword,
      role,
      nickname,
      phone,
    });

    // 生成双 Token
    const tokens = this.generateTokenPair(user);

    // 返回用户信息（不含密码）
    return {
      user: stripPassword(user),
      ...tokens,
    };
  }

  async login(loginDto: LoginDto): Promise<{
    user: Partial<User>;
    access_token: string;
    refresh_token: string;
  }> {
    const { username, password } = loginDto;

    // 查找用户
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 生成双 Token
    const tokens = this.generateTokenPair(user);

    // 返回用户信息（不含密码）
    return {
      user: stripPassword(user),
      ...tokens,
    };
  }

  /**
   * 使用 refresh_token 换取新的 token 对。
   * 验证 refresh_token 有效性，查询最新用户信息（防角色变更后旧 token 越权）。
   */
  async refreshToken(
    refreshToken: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    try {
      /* eslint-disable @typescript-eslint/no-unsafe-assignment */
      const raw = this.jwtService.verify(refreshToken);
      const payload: { sub: number; type?: string } = raw;
      /* eslint-enable @typescript-eslint/no-unsafe-assignment */

      // 仅接受 type=refresh 的 token
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('无效的 refresh token');
      }

      // 从数据库获取最新用户信息
      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('用户不存在');
      }

      // 版本号校验：登出后 tokenVersion 递增，旧 token 的 version 不再匹配
      if ((payload as { version?: number }).version !== user.tokenVersion) {
        throw new UnauthorizedException('refresh token 已吊销，请重新登录');
      }

      return this.generateTokenPair(user);
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('refresh token 已过期或无效');
    }
  }

  /**
   * 登出：递增 tokenVersion，使当前用户所有旧 refresh_token 立即失效。
   * access_token 在 15 分钟内仍有效（无状态设计的固有权衡），
   * 如需完全吊销可额外搭配 Redis TTL 黑名单。
   */
  async logout(userId: number): Promise<void> {
    await this.usersService.incrementTokenVersion(userId);
  }

  async validateUser(userId: number): Promise<User | null> {
    return this.usersService.findById(userId);
  }
}
