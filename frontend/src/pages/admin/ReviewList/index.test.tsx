import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { message } from 'antd';
import ReviewList from './index';
import { renderWithProviders } from '../../../test/render';

const hotelApiMock = vi.hoisted(() => ({
  getMyHotels: vi.fn(),
  getHotelById: vi.fn(),
  createHotel: vi.fn(),
  updateHotel: vi.fn(),
  deleteHotel: vi.fn(),
  submitForReview: vi.fn(),
  getMerchantStatistics: vi.fn(),
  getPendingHotels: vi.fn(),
  approveHotel: vi.fn(),
  rejectHotel: vi.fn(),
  offlineHotel: vi.fn(),
  onlineHotel: vi.fn(),
  getAdminStatistics: vi.fn(),
}));

vi.mock('../../../services/api', async () => {
  const actual = await vi.importActual<typeof import('../../../services/api')>('../../../services/api');
  return {
    ...actual,
    hotelApi: hotelApiMock,
  };
});

describe('Admin review list', () => {
  beforeEach(() => {
    Object.values(hotelApiMock).forEach((mockFn) => {
      if (typeof mockFn === 'function' && 'mockReset' in mockFn) {
        mockFn.mockReset();
      }
    });
    vi.spyOn(message, 'success').mockImplementation(() => undefined as never);
    vi.spyOn(message, 'error').mockImplementation(() => undefined as never);
  });

  it('approves a pending hotel and refreshes the review list', async () => {
    const pendingHotel = {
      id: 1,
      nameCn: '待审核酒店',
      nameEn: 'Pending Hotel',
      address: '北京市朝阳区测试路 9 号',
      starRating: 5,
      roomTypes: [],
      images: [],
      merchant: { id: 2, username: 'merchant01', nickname: '测试商户' },
      status: 'pending',
      rejectReason: null,
      createdAt: '2026-03-09T10:00:00.000Z',
      updatedAt: '2026-03-09T10:00:00.000Z',
    };

    hotelApiMock.getPendingHotels.mockResolvedValue({
      data: [pendingHotel],
      page: 1,
      pageSize: 10,
      total: 1,
      totalPages: 1,
    });
    hotelApiMock.approveHotel.mockResolvedValue({
      ...pendingHotel,
      status: 'approved',
    });

    renderWithProviders(<ReviewList />, { route: '/admin/review' });

    expect(await screen.findByText('待审核酒店')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /通过/ }));

    await waitFor(() => {
      expect(hotelApiMock.approveHotel).toHaveBeenCalledWith(1);
    });
    await waitFor(() => {
      expect(hotelApiMock.getPendingHotels).toHaveBeenCalledTimes(2);
    });
  });
});
