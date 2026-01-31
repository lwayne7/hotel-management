import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { hotelApi } from '../../services/api';

export type HotelStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'offline';
export type DiscountType = 'none' | 'percentage' | 'fixed' | 'package';

export interface RoomType {
  id?: number;
  name: string;
  price: number;
  originalPrice?: number;
  discountType: DiscountType;
  discountValue?: number;
  discountDescription?: string;
  maxGuests: number;
  bedType?: string;
  roomSize?: number;
  amenities?: string[];
}

export interface HotelImage {
  id?: number;
  imageUrl: string;
  sortOrder: number;
  description?: string;
}

export interface Hotel {
  id: number;
  nameCn: string;
  nameEn?: string;
  address: string;
  starRating: number;
  openingDate?: string;
  description?: string;
  facilities?: string[];
  nearbyAttractions?: string[];
  transportation?: string[];
  status: HotelStatus;
  rejectReason?: string;
  merchantId: number;
  roomTypes: RoomType[];
  images: HotelImage[];
  createdAt: string;
  updatedAt: string;
}

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
  async (params: { page?: number; status?: HotelStatus }, { rejectWithValue }) => {
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
        state.hotels = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          pageSize: action.payload.pageSize,
          total: action.payload.total,
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
        state.currentHotel = action.payload;
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
        state.hotels.unshift(action.payload);
      })
      .addCase(createHotel.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update hotel
      .addCase(updateHotel.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.hotels.findIndex((h) => h.id === action.payload.id);
        if (index !== -1) {
          state.hotels[index] = action.payload;
        }
        state.currentHotel = action.payload;
      })
      // Submit for review
      .addCase(submitForReview.fulfilled, (state, action) => {
        const index = state.hotels.findIndex((h) => h.id === action.payload.id);
        if (index !== -1) {
          state.hotels[index] = action.payload;
        }
      });
  },
});

export const { clearCurrentHotel, clearError } = hotelSlice.actions;
export default hotelSlice.reducer;
