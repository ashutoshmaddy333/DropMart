import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { TrackingData } from "@/lib/api/types";

interface TrackingState {
  data: TrackingData | null;
  liveUpdate: Partial<TrackingData> | null;
  connected: boolean;
}

const initialState: TrackingState = { data: null, liveUpdate: null, connected: false };

const trackingSlice = createSlice({
  name: "tracking",
  initialState,
  reducers: {
    setTrackingData(state, action: PayloadAction<TrackingData>) {
      state.data = action.payload;
    },
    updateLiveLocation(state, action: PayloadAction<Partial<TrackingData>>) {
      state.liveUpdate = action.payload;
      if (state.data) {
        state.data = { ...state.data, ...action.payload };
      }
    },
    setConnected(state, action: PayloadAction<boolean>) {
      state.connected = action.payload;
    },
    clearTracking(state) {
      state.data = null;
      state.liveUpdate = null;
      state.connected = false;
    },
  },
});

export const { setTrackingData, updateLiveLocation, setConnected, clearTracking } = trackingSlice.actions;
export default trackingSlice.reducer;
