import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { RegisterDto } from './register.dto';
import { LoginDto } from './login.dto';
import { RefreshTokenDto } from './refresh-token.dto';

describe('RegisterDto validation', () => {
    function toDto(data: Partial<RegisterDto>): RegisterDto {
        return plainToInstance(RegisterDto, data);
    }

    it('should pass with valid merchant registration', async () => {
        const dto = toDto({
            username: 'merchant001',
            password: 'password123',
            role: 'merchant' as any,
        });
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });

    it('should pass with valid customer registration', async () => {
        const dto = toDto({
            username: 'customer01',
            password: 'abc12345',
            role: 'customer' as any,
        });
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });

    it('should reject admin role registration (whitelist)', async () => {
        const dto = toDto({
            username: 'adminuser1',
            password: 'password123',
            role: 'admin' as any,
        });
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        const roleError = errors.find((e) => e.property === 'role');
        expect(roleError).toBeDefined();
    });

    it('should reject empty username', async () => {
        const dto = toDto({
            username: '',
            password: 'password123',
            role: 'merchant' as any,
        });
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some((e) => e.property === 'username')).toBe(true);
    });

    it('should reject username shorter than 6 characters', async () => {
        const dto = toDto({
            username: 'abc',
            password: 'password123',
            role: 'merchant' as any,
        });
        const errors = await validate(dto);
        expect(errors.some((e) => e.property === 'username')).toBe(true);
    });

    it('should reject username longer than 20 characters', async () => {
        const dto = toDto({
            username: 'a'.repeat(21),
            password: 'password123',
            role: 'merchant' as any,
        });
        const errors = await validate(dto);
        expect(errors.some((e) => e.property === 'username')).toBe(true);
    });

    it('should reject password shorter than 8 characters', async () => {
        const dto = toDto({
            username: 'merchant001',
            password: 'abc1',
            role: 'merchant' as any,
        });
        const errors = await validate(dto);
        expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    it('should reject password without digits', async () => {
        const dto = toDto({
            username: 'merchant001',
            password: 'abcdefgh',
            role: 'merchant' as any,
        });
        const errors = await validate(dto);
        expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    it('should reject password without letters', async () => {
        const dto = toDto({
            username: 'merchant001',
            password: '12345678',
            role: 'merchant' as any,
        });
        const errors = await validate(dto);
        expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    it('should allow optional nickname and phone', async () => {
        const dto = toDto({
            username: 'merchant001',
            password: 'password123',
            role: 'merchant' as any,
            nickname: '张三酒店',
            phone: '13800138000',
        });
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });
});

describe('LoginDto validation', () => {
    function toDto(data: Partial<LoginDto>): LoginDto {
        return plainToInstance(LoginDto, data);
    }

    it('should pass with valid credentials', async () => {
        const dto = toDto({ username: 'merchant001', password: 'password123' });
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });

    it('should reject empty username', async () => {
        const dto = toDto({ username: '', password: 'password123' });
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject empty password', async () => {
        const dto = toDto({ username: 'merchant001', password: '' });
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject missing fields', async () => {
        const dto = toDto({});
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
    });
});

describe('RefreshTokenDto validation', () => {
    function toDto(data: Partial<RefreshTokenDto>): RefreshTokenDto {
        return plainToInstance(RefreshTokenDto, data);
    }

    it('should pass with valid refresh token', async () => {
        const dto = toDto({ refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' });
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });

    it('should reject empty refresh token', async () => {
        const dto = toDto({ refreshToken: '' });
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject missing refresh token', async () => {
        const dto = toDto({});
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
    });
});
