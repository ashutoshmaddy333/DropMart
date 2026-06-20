import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiFetch } from "@/lib/api/client";
import type { ApiOrder } from "@/lib/api/types";
import type { RootState } from "../index";

interface OrdersState {
  items: ApiOrder[];
  current: ApiOrder | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrdersState = { items: [], current: null, loading: false, error: null };

export const fetchMyOrders = createAsyncThunk(
  "orders/fetchMine",
  async (_, { getState }) => {
    const token = (getState() as RootState).auth.token;
    return apiFetch<ApiOrder[]>("/orders/me", { token });
  },
);

export const fetchSupplierOrders = createAsyncThunk(
  "orders/fetchSupplier",
  async (_, { getState }) => {
    const token = (getState() as RootState).auth.token;
    return apiFetch<ApiOrder[]>("/orders/supplier/mine", { token });
  },
);

export const fetchAllOrders = createAsyncThunk(
  "orders/fetchAll",
  async (_, { getState }) => {
    const token = (getState() as RootState).auth.token;
    return apiFetch<ApiOrder[]>("/orders", { token });
  },
);

export const fetchOrderById = createAsyncThunk(
  "orders/fetchById",
  async (id: string, { getState }) => {
    const token = (getState() as RootState).auth.token;
    return apiFetch<ApiOrder>(`/orders/${id}`, { token });
  },
);

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setTrackingUpdate(state, action) {
      if (state.current && state.current.id === action.payload.orderId && state.current.delivery) {
        state.current.delivery = {
          ...state.current.delivery,
          lat: action.payload.lat ?? state.current.delivery.lat,
          lng: action.payload.lng ?? state.current.delivery.lng,
          status: action.payload.status ?? state.current.delivery.status,
          statusLabel: action.payload.statusLabel ?? state.current.delivery.statusLabel,
          estimatedMins: action.payload.estimatedMins ?? state.current.delivery.estimatedMins,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyOrders.pending, (state) => { state.loading = true; })
      .addCase(fetchMyOrders.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchMyOrders.rejected, (state) => { state.loading = false; })
      .addCase(fetchSupplierOrders.fulfilled, (state, action) => { state.items = action.payload; })
      .addCase(fetchAllOrders.fulfilled, (state, action) => { state.items = action.payload; })
      .addCase(fetchOrderById.fulfilled, (state, action) => { state.current = action.payload; });
  },
});

export const { setTrackingUpdate } = ordersSlice.actions;
export default ordersSlice.reducer;
