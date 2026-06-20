import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiFetch } from "@/lib/api/client";
import type { ApiProduct } from "@/lib/api/products";
import type { RootState } from "../index";

interface ProductsState {
  items: ApiProduct[];
  current: ApiProduct | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProductsState = { items: [], current: null, loading: false, error: null };

export const fetchProducts = createAsyncThunk(
  "products/fetchAll",
  async (params?: { q?: string; category?: string; flashDeals?: boolean; featured?: boolean }) => {
    const search = new URLSearchParams();
    if (params?.q) search.set("q", params.q);
    if (params?.category) search.set("category", params.category);
    if (params?.flashDeals) search.set("flashDeals", "true");
    if (params?.featured) search.set("featured", "true");
    const qs = search.toString();
    return apiFetch<ApiProduct[]>(`/products${qs ? `?${qs}` : ""}`);
  },
);

export const fetchProductBySlug = createAsyncThunk(
  "products/fetchBySlug",
  async (slug: string) => apiFetch<ApiProduct>(`/products/${slug}`),
);

export const fetchSupplierProducts = createAsyncThunk(
  "products/fetchSupplier",
  async (_, { getState }) => {
    const token = (getState() as RootState).auth.token;
    return apiFetch<ApiProduct[]>("/products/supplier/mine", { token });
  },
);

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: { clearCurrent(state) { state.current = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(fetchSupplierProducts.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  },
});

export const { clearCurrent } = productsSlice.actions;
export default productsSlice.reducer;
