import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Shop {
  id: string;
  name: string;
  address: string;
  gst: string;
  phone: string;
  email: string;
  adminId: string;
}

interface ShopState {
  shops: Shop[];
  currentShop: Shop | null;
  loading: boolean;
  error: string | null;
}

const initialState: ShopState = {
  shops: [],
  currentShop: null,
  loading: false,
  error: null,
};

const shopSlice = createSlice({
  name: 'shop',
  initialState,
  reducers: {
    setShops: (state, action: PayloadAction<Shop[]>) => {
      state.shops = action.payload;
    },
    setCurrentShop: (state, action: PayloadAction<Shop>) => {
      state.currentShop = action.payload;
    },
    addShop: (state, action: PayloadAction<Shop>) => {
      state.shops.push(action.payload);
    },
    updateShop: (state, action: PayloadAction<Shop>) => {
      const index = state.shops.findIndex(shop => shop.id === action.payload.id);
      if (index !== -1) {
        state.shops[index] = action.payload;
      }
    },
    deleteShop: (state, action: PayloadAction<string>) => {
      state.shops = state.shops.filter(shop => shop.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { 
  setShops, 
  setCurrentShop, 
  addShop, 
  updateShop, 
  deleteShop, 
  setLoading, 
  setError 
} = shopSlice.actions;

export default shopSlice.reducer;
