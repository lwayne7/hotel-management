import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { hotelApi, type HotelListResult } from '../../services/api';
import { getApiErrorMessage } from '../../utils/error';
import type { Hotel, HotelStatus, DiscountType, RoomType, HotelImage } from '../../types/hotel';

export type { Hotel, HotelStatus, DiscountType, RoomType, HotelImage };

interface HotelState {
  hotels: Hotel[];
  currentHotel: Hotel | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

const initialState: HotelState = {
  hotels: [],
  currentHotel: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
  },
};

export const fetchMyHotels = createAsyncThunk<
  HotelListResult,
  { page?: number; status?: HotelStatus; keyword?: string },
  { rejectValue: string }
>('hotel/fetchMyHotels', async (params, { rejectWithValue }) => {
  try {
    return await hotelApi.getMyHotels(params);
  } catch (error: unknown) {
    return rejectWithValue(getApiErrorMessage(error, '获取酒店列表失败'));
  }
});

export const fetchHotelById = createAsyncThunk<Hotel, number, { rejectValue: string }>(
  'hotel/fetchHotelById',
  async (id, { rejectWithValue }) => {
    try {
      return await hotelApi.getHotelById(id);
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, '获取酒店详情失败'));
    }
  },
);

export const createHotel = createAsyncThunk<Hotel, Partial<Hotel>, { rejectValue: string }>(
  'hotel/createHotel',
  async (data, { rejectWithValue }) => {
    try {
      return await hotelApi.createHotel(data);
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, '创建酒店失败'));
    }
  },
);

export const updateHotel = createAsyncThunk<
  Hotel,
  { id: number; data: Partial<Hotel> },
  { rejectValue: string }
>('hotel/updateHotel', async ({ id, data }, { rejectWithValue }) => {
  try {
    return await hotelApi.updateHotel(id, data);
  } catch (error: unknown) {
    return rejectWithValue(getApiErrorMessage(error, '更新酒店失败'));
  }
});

export const submitForReview = createAsyncThunk<Hotel, number, { rejectValue: string }>(
  'hotel/submitForReview',
  async (id, { rejectWithValue }) => {
    try {
      return await hotelApi.submitForReview(id);
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, '提交审核失败'));
    }
  },
);

const hotelSlice = createSlice({
  name: 'hotel',
  initialState,
  reducers: {
    clearCurrentHotel: (state) => {
      state.currentHotel = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyHotels.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyHotels.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hotels = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          pageSize: action.payload.pageSize,
          total: action.payload.total,
        };
      })
      .addCase(fetchMyHotels.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? '获取酒店列表失败';
      })
      .addCase(fetchHotelById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHotelById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentHotel = action.payload;
      })
      .addCase(fetchHotelById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? '获取酒店详情失败';
      })
      .addCase(createHotel.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createHotel.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hotels.unshift(action.payload);
      })
      .addCase(createHotel.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? '创建酒店失败';
      })
      .addCase(updateHotel.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedHotel = action.payload;
        const index = state.hotels.findIndex((hotel) => hotel.id === updatedHotel.id);
        if (index !== -1) {
          state.hotels[index] = updatedHotel;
        }
        state.currentHotel = updatedHotel;
      })
      .addCase(updateHotel.rejected, (state, action) => {
        state.error = action.payload ?? '更新酒店失败';
      })
      .addCase(submitForReview.fulfilled, (state, action) => {
        const submittedHotel = action.payload;
        const index = state.hotels.findIndex((hotel) => hotel.id === submittedHotel.id);
        if (index !== -1) {
          state.hotels[index] = submittedHotel;
        }
      })
      .addCase(submitForReview.rejected, (state, action) => {
        state.error = action.payload ?? '提交审核失败';
      });
  },
});

export const { clearCurrentHotel, clearError } = hotelSlice.actions;
export default hotelSlice.reducer;
