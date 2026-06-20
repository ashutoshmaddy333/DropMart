import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiFetch } from "@/lib/api/client";
import type { MasterData } from "@/lib/api/types";

interface MastersState {
  data: MasterData | null;
  loading: boolean;
  error: string | null;
}

const initialState: MastersState = { data: null, loading: false, error: null };

export const fetchMasters = createAsyncThunk("masters/fetch", async () => {
  return apiFetch<MasterData>("/masters");
});

const mastersSlice = createSlice({
  name: "masters",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMasters.pending, (state) => { state.loading = true; })
      .addCase(fetchMasters.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchMasters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load masters";
      });
  },
});

export default mastersSlice.reducer;
