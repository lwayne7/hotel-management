import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User, UserRole } from '../users/entities/user.entity';

function buildMockUser(userData: Partial<User>, id: number): User {
  return {
    id,
    username: userData.username ?? '',
    password: userData.password ?? '',
    role: userData.role ?? UserRole.MERCHANT,
    nickname: userData.nickname ?? null,
    phone: userData.phone ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
    hotels: [],
  } as User;
}

describe('AuthService', () => {
  let authService: AuthService;
  let mockUsersService: jest.Mocked<
    Pick<
      UsersService,
      'findByUsername' | 'findById' | 'create' | 'existsByUsername'
    >
  >;
  let mockJwtService: jest.Mocked<Pick<JwtService, 'sign' | 'verify'>>;
  let mockConfigService: jest.Mocked<Pick<ConfigService, 'get'>>;

  /** Auto-increment counter for mock-created users */
  let nextUserId: number;

  beforeEach(() => {
    nextUserId = 1;

    mockUsersService = {
      findByUsername: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      existsByUsername: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock_token'),
      verify: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn(),
    };

    authService = new AuthService(
      mockUsersService as unknown as UsersService,
      mockJwtService as unknown as JwtService,
      mockConfigService as unknown as ConfigService,
    );
  });

  // ============ register ============
  describe('register', () => {
    it('should create a new user with hashed password and return dual tokens', async () => {
      mockUsersService.existsByUsername.mockResolvedValue(false);
      mockUsersService.create.mockImplementation(async (userData: Partial<User>) =>
        buildMockUser(userData, nextUserId++),
      );

      const result = await authService.register({
        username: 'merchant001',
        password: 'Password123',
        role: UserRole.MERCHANT,
        nickname: 'Test Merchant',
        phone: '13800000000',
      });

      // Should check existence first
      expect(mockUsersService.existsByUsername).toHaveBeenCalledWith(
        'merchant001',
      );

      // The password stored should be a bcrypt hash, not plaintext
      const createCall = mockUsersService.create.mock.calls[0][0];
      expect(createCall.username).toBe('merchant001');
      expect(createCall.password).not.toBe('Password123');
      expect(typeof createCall.password).toBe('string');
      const hashedPassword = createCall.password as string;
      const isHashed = await bcrypt.compare('Password123', hashedPassword);
      expect(isHashed).toBe(true);

      // Should sign JWT twice: access_token + refresh_token
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);

      // First call: access_token with user payload and 15m expiry
      expect(mockJwtService.sign).toHaveBeenNthCalledWith(
        1,
        { sub: expect.any(Number) as number, username: 'merchant001', role: UserRole.MERCHANT },
        { expiresIn: '15m' },
      );
      // Second call: refresh_token with type=refresh and 7d expiry
      expect(mockJwtService.sign).toHaveBeenNthCalledWith(
        2,
        { sub: expect.any(Number) as number, type: 'refresh' },
        { expiresIn: '7d' },
      );

      // Should return both tokens and user without password
      expect(result.access_token).toBe('mock_token');
      expect(result.refresh_token).toBe('mock_token');
      expect(result.user).toBeDefined();
      expect(result.user).not.toHaveProperty('password');
      expect(result.user.username).toBe('merchant001');
    });

    it('should throw ConflictException when username already exists', async () => {
      mockUsersService.existsByUsername.mockResolvedValue(true);

      await expect(
        authService.register({
          username: 'existing_user',
          password: 'Password123',
          role: UserRole.MERCHANT,
        }),
      ).rejects.toThrow(ConflictException);

      // Should NOT attempt to create
      expect(mockUsersService.create).not.toHaveBeenCalled();
    });

    it('should work correctly with merchant role', async () => {
      mockUsersService.existsByUsername.mockResolvedValue(false);
      mockUsersService.create.mockImplementation(async (userData: Partial<User>) =>
        buildMockUser(userData, nextUserId++),
      );

      const result = await authService.register({
        username: 'merchant002',
        password: 'Password123',
        role: UserRole.MERCHANT,
      });

      expect(result.access_token).toBe('mock_token');
      expect(result.refresh_token).toBe('mock_token');
      // access_token sign should contain the correct role
      expect(mockJwtService.sign).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ role: UserRole.MERCHANT }),
        expect.any(Object),
      );
    });

    it('should work correctly with customer role', async () => {
      mockUsersService.existsByUsername.mockResolvedValue(false);
      mockUsersService.create.mockImplementation(async (userData: Partial<User>) =>
        buildMockUser(userData, nextUserId++),
      );

      const result = await authService.register({
        username: 'customer001',
        password: 'Password123',
        role: UserRole.CUSTOMER,
      });

      expect(result.access_token).toBe('mock_token');
      expect(result.refresh_token).toBe('mock_token');
      expect(mockJwtService.sign).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ role: UserRole.CUSTOMER }),
        expect.any(Object),
      );
    });
  });

  // ============ login ============
  describe('login', () => {
    const HASHED_PASSWORD = bcrypt.hashSync('Password123', 10);

    it('should return dual tokens for valid credentials', async () => {
      mockUsersService.findByUsername.mockResolvedValue({
        id: 1,
        username: 'merchant001',
        password: HASHED_PASSWORD,
        role: UserRole.MERCHANT,
        nickname: 'Test',
        phone: '13800000000',
      } as User);

      const result = await authService.login({
        username: 'merchant001',
        password: 'Password123',
      });

      // Should sign twice: access + refresh
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
      expect(mockJwtService.sign).toHaveBeenNthCalledWith(
        1,
        { sub: 1, username: 'merchant001', role: UserRole.MERCHANT },
        { expiresIn: '15m' },
      );
      expect(result.access_token).toBe('mock_token');
      expect(result.refresh_token).toBe('mock_token');
      expect(result.user).toBeDefined();
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw UnauthorizedException for invalid username', async () => {
      mockUsersService.findByUsername.mockResolvedValue(null);

      await expect(
        authService.login({
          username: 'nonexistent',
          password: 'Password123',
        }),
      ).rejects.toThrow(UnauthorizedException);

      // Should NOT attempt to sign a token
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      mockUsersService.findByUsername.mockResolvedValue({
        id: 1,
        username: 'merchant001',
        password: HASHED_PASSWORD,
        role: UserRole.MERCHANT,
      } as User);

      await expect(
        authService.login({
          username: 'merchant001',
          password: 'WrongPassword1',
        }),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });
  });

  // ============ refreshToken ============
  describe('refreshToken', () => {
    it('should return new token pair for valid refresh token', async () => {
      mockJwtService.verify.mockReturnValue({ sub: 1, type: 'refresh' });
      mockUsersService.findById.mockResolvedValue({
        id: 1,
        username: 'merchant001',
        role: UserRole.MERCHANT,
      } as User);

      const result = await authService.refreshToken('valid_refresh_token');

      expect(mockJwtService.verify).toHaveBeenCalledWith('valid_refresh_token');
      expect(result.access_token).toBe('mock_token');
      expect(result.refresh_token).toBe('mock_token');
    });

    it('should reject access token used as refresh token', async () => {
      mockJwtService.verify.mockReturnValue({
        sub: 1,
        username: 'merchant001',
        role: UserRole.MERCHANT,
        // No type: 'refresh' — this is an access token
      });

      await expect(
        authService.refreshToken('access_token_not_refresh'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should reject if user no longer exists', async () => {
      mockJwtService.verify.mockReturnValue({ sub: 999, type: 'refresh' });
      mockUsersService.findById.mockResolvedValue(null);

      await expect(
        authService.refreshToken('valid_but_user_deleted'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should reject expired/invalid token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await expect(
        authService.refreshToken('expired_token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ============ validateUser ============
  describe('validateUser', () => {
    it('should return user when exists', async () => {
      const mockUser = {
        id: 1,
        username: 'merchant001',
        role: UserRole.MERCHANT,
        nickname: 'Test',
        phone: '13800000000',
      } as User;
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await authService.validateUser(1);
      expect(result).toEqual(mockUser);
      expect(mockUsersService.findById).toHaveBeenCalledWith(1);
    });

    it('should return null when user not found', async () => {
      mockUsersService.findById.mockResolvedValue(null);

      const result = await authService.validateUser(999);
      expect(result).toBeNull();
      expect(mockUsersService.findById).toHaveBeenCalledWith(999);
    });
  });
});
