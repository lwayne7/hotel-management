import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateOrderDto } from './create-order.dto';

describe('CreateOrderDto validation', () => {
    function toDto(data: Record<string, any>): CreateOrderDto {
        return plainToInstance(CreateOrderDto, data);
    }

    it('should pass with valid order data', async () => {
        const dto = toDto({
            hotelId: 1,
            roomTypeId: 101,
            checkInDate: '2026-03-10',
            checkOutDate: '2026-03-12',
            rooms: 1,
            guests: 2,
        });
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });

    it('should reject hotelId less than 1', async () => {
        const dto = toDto({
            hotelId: 0,
            roomTypeId: 101,
            checkInDate: '2026-03-10',
            checkOutDate: '2026-03-12',
            rooms: 1,
            guests: 2,
        });
        const errors = await validate(dto);
        expect(errors.some((e) => e.property === 'hotelId')).toBe(true);
    });

    it('should reject roomTypeId less than 1', async () => {
        const dto = toDto({
            hotelId: 1,
            roomTypeId: -1,
            checkInDate: '2026-03-10',
            checkOutDate: '2026-03-12',
            rooms: 1,
            guests: 2,
        });
        const errors = await validate(dto);
        expect(errors.some((e) => e.property === 'roomTypeId')).toBe(true);
    });

    it('should reject invalid date format', async () => {
        const dto = toDto({
            hotelId: 1,
            roomTypeId: 101,
            checkInDate: 'not-a-date',
            checkOutDate: '2026-03-12',
            rooms: 1,
            guests: 2,
        });
        const errors = await validate(dto);
        expect(errors.some((e) => e.property === 'checkInDate')).toBe(true);
    });

    it('should reject rooms less than 1', async () => {
        const dto = toDto({
            hotelId: 1,
            roomTypeId: 101,
            checkInDate: '2026-03-10',
            checkOutDate: '2026-03-12',
            rooms: 0,
            guests: 2,
        });
        const errors = await validate(dto);
        expect(errors.some((e) => e.property === 'rooms')).toBe(true);
    });

    it('should reject guests less than 1', async () => {
        const dto = toDto({
            hotelId: 1,
            roomTypeId: 101,
            checkInDate: '2026-03-10',
            checkOutDate: '2026-03-12',
            rooms: 1,
            guests: 0,
        });
        const errors = await validate(dto);
        expect(errors.some((e) => e.property === 'guests')).toBe(true);
    });

    it('should accept string numbers via Transform', async () => {
        const dto = toDto({
            hotelId: '5',
            roomTypeId: '101',
            checkInDate: '2026-03-10',
            checkOutDate: '2026-03-12',
            rooms: '2',
            guests: '3',
        });
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
        expect(dto.hotelId).toBe(5);
        expect(dto.rooms).toBe(2);
    });

    it('should reject missing required fields', async () => {
        const dto = toDto({});
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
    });
});
