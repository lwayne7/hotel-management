import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { message } from 'antd';
import MerchantHotels from './index';
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

describe('Merchant hotel list', () => {
  beforeEach(() => {
    Object.values(hotelApiMock).forEach((mockFn) => {
      if (typeof mockFn === 'function' && 'mockReset' in mockFn) {
        mockFn.mockReset();
      }
    });
    vi.spyOn(message, 'success').mockImplementation(() => undefined as never);
    vi.spyOn(message, 'error').mockImplementation(() => undefined as never);
  });

  it('submits a draft hotel for review and reloads the list', async () => {
    const draftHotel = {
      id: 1,
      nameCn: '测试酒店',
      nameEn: 'Test Hotel',
      address: '上海市浦东新区测试路 1 号',
      starRating: 4,
      roomTypes: [],
      status: 'draft',
      rejectReason: null,
      createdAt: '2026-03-09T10:00:00.000Z',
      updatedAt: '2026-03-09T10:00:00.000Z',
    };

    hotelApiMock.getMyHotels.mockResolvedValue({
      data: [draftHotel],
      page: 1,
      pageSize: 10,
      total: 1,
      totalPages: 1,
    });
    hotelApiMock.submitForReview.mockResolvedValue({
      ...draftHotel,
      status: 'pending',
    });

    renderWithProviders(<MerchantHotels />, { route: '/merchant/hotels' });

    expect(await screen.findByText('测试酒店')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /提交审核/ }));

    await waitFor(() => {
      expect(hotelApiMock.submitForReview).toHaveBeenCalledWith(1);
    });
    await waitFor(() => {
      expect(hotelApiMock.getMyHotels).toHaveBeenCalledTimes(2);
    });
  });
});
