import { describe, it, expect, vi } from 'vitest';
import type { Hotel } from '../../types/hotel';
import hotelReducer, {
  clearCurrentHotel,
  clearError,
  fetchMyHotels,
  fetchHotelById,
  createHotel,
  updateHotel,
  submitForReview,
} from './hotelSlice';

vi.mock('../../services/api', () => ({
  hotelApi: {
    getMyHotels: vi.fn(),
    getHotelById: vi.fn(),
    createHotel: vi.fn(),
    updateHotel: vi.fn(),
    submitForReview: vi.fn(),
  },
}));

vi.mock('../../utils/error', () => ({
  getApiErrorMessage: (_err: unknown, fallback: string) => fallback,
}));

const emptyState = {
  hotels: [],
  currentHotel: null,
  isLoading: false,
  error: null,
  pagination: { page: 1, pageSize: 10, total: 0 },
};

const sampleHotel: Hotel = {
  id: 1,
  nameCn: '测试酒店',
  nameEn: 'Test Hotel',
  address: '北京市朝阳区',
  starRating: 4,
  status: 'draft' as const,
  merchantId: 1,
  roomTypes: [],
  images: [],
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

describe('hotelSlice', () => {
  it('should return initial state', () => {
    const state = hotelReducer(undefined, { type: 'unknown' });
    expect(state.hotels).toEqual([]);
    expect(state.currentHotel).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  describe('clearCurrentHotel', () => {
    it('should set currentHotel to null', () => {
      const stateWithHotel = { ...emptyState, currentHotel: sampleHotel };
      const state = hotelReducer(stateWithHotel, clearCurrentHotel());
      expect(state.currentHotel).toBeNull();
    });
  });

  describe('clearError', () => {
    it('should clear error', () => {
      const stateWithError = { ...emptyState, error: 'some error' };
      const state = hotelReducer(stateWithError, clearError());
      expect(state.error).toBeNull();
    });
  });

  describe('fetchMyHotels', () => {
    it('pending should set isLoading true', () => {
      const state = hotelReducer(emptyState, { type: fetchMyHotels.pending.type });
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('fulfilled should populate hotels and pagination', () => {
      const payload = {
        data: [sampleHotel],
        page: 1,
        pageSize: 10,
        total: 1,
      };
      const state = hotelReducer(emptyState, {
        type: fetchMyHotels.fulfilled.type,
        payload,
      });
      expect(state.isLoading).toBe(false);
      expect(state.hotels).toHaveLength(1);
      expect(state.pagination.total).toBe(1);
    });

    it('rejected should set error', () => {
      const state = hotelReducer(emptyState, {
        type: fetchMyHotels.rejected.type,
        payload: '获取酒店列表失败',
      });
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('获取酒店列表失败');
    });
  });

  describe('fetchHotelById', () => {
    it('fulfilled should set currentHotel', () => {
      const state = hotelReducer(emptyState, {
        type: fetchHotelById.fulfilled.type,
        payload: sampleHotel,
      });
      expect(state.currentHotel).toEqual(sampleHotel);
    });
  });

  describe('createHotel', () => {
    it('fulfilled should prepend hotel to list', () => {
      const state = hotelReducer(emptyState, {
        type: createHotel.fulfilled.type,
        payload: sampleHotel,
      });
      expect(state.hotels[0]).toEqual(sampleHotel);
    });
  });

  describe('updateHotel', () => {
    it('fulfilled should update hotel in list', () => {
      const stateWithHotel = { ...emptyState, hotels: [sampleHotel] };
      const updated = { ...sampleHotel, nameCn: '修改后的酒店' };
      const state = hotelReducer(stateWithHotel, {
        type: updateHotel.fulfilled.type,
        payload: updated,
      });
      expect(state.hotels[0].nameCn).toBe('修改后的酒店');
      expect(state.currentHotel?.nameCn).toBe('修改后的酒店');
    });
  });

  describe('submitForReview', () => {
    it('fulfilled should update hotel status in list', () => {
      const stateWithHotel = { ...emptyState, hotels: [sampleHotel] };
      const submitted = { ...sampleHotel, status: 'pending' as const };
      const state = hotelReducer(stateWithHotel, {
        type: submitForReview.fulfilled.type,
        payload: submitted,
      });
      expect(state.hotels[0].status).toBe('pending');
    });

    it('rejected should set error', () => {
      const state = hotelReducer(emptyState, {
        type: submitForReview.rejected.type,
        payload: '提交审核失败',
      });
      expect(state.error).toBe('提交审核失败');
    });
  });
});
