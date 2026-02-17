import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { hotelApi } from '../../services/api';
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

// 异步 Thunks
export const fetchMyHotels = createAsyncThunk(
  'hotel/fetchMyHotels',
  async (params: { page?: number; status?: HotelStatus; keyword?: string }, { rejectWithValue }) => {
    try {
      const response = await hotelApi.getMyHotels(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取酒店列表失败');
    }
  }
);

export const fetchHotelById = createAsyncThunk(
  'hotel/fetchHotelById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await hotelApi.getHotelById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取酒店详情失败');
    }
  }
);

export const createHotel = createAsyncThunk(
  'hotel/createHotel',
  async (data: Partial<Hotel>, { rejectWithValue }) => {
    try {
      const response = await hotelApi.createHotel(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '创建酒店失败');
    }
  }
);

export const updateHotel = createAsyncThunk(
  'hotel/updateHotel',
  async ({ id, data }: { id: number; data: Partial<Hotel> }, { rejectWithValue }) => {
    try {
      const response = await hotelApi.updateHotel(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '更新酒店失败');
    }
  }
);

export const submitForReview = createAsyncThunk(
  'hotel/submitForReview',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await hotelApi.submitForReview(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '提交审核失败');
    }
  }
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
      // Fetch my hotels
      .addCase(fetchMyHotels.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyHotels.fulfilled, (state, action) => {
        state.isLoading = false;
        const payload = action.payload as unknown as { data: Hotel[]; page: number; pageSize: number; total: number };
        state.hotels = payload.data;
        state.pagination = {
          page: payload.page,
          pageSize: payload.pageSize,
          total: payload.total,
        };
      })
      .addCase(fetchMyHotels.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch hotel by id
      .addCase(fetchHotelById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHotelById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentHotel = action.payload as unknown as Hotel;
      })
      .addCase(fetchHotelById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create hotel
      .addCase(createHotel.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createHotel.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hotels.unshift(action.payload as unknown as Hotel);
      })
      .addCase(createHotel.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update hotel
      .addCase(updateHotel.fulfilled, (state, action) => {
        state.isLoading = false;
        const hotel = action.payload as unknown as Hotel;
        const index = state.hotels.findIndex((h) => h.id === hotel.id);
        if (index !== -1) {
          state.hotels[index] = hotel;
        }
        state.currentHotel = hotel;
      })
      // Submit for review
      .addCase(submitForReview.fulfilled, (state, action) => {
        const hotel = action.payload as unknown as Hotel;
        const index = state.hotels.findIndex((h) => h.id === hotel.id);
        if (index !== -1) {
          state.hotels[index] = hotel;
        }
      });
  },
});

export const { clearCurrentHotel, clearError } = hotelSlice.actions;
export default hotelSlice.reducer;
