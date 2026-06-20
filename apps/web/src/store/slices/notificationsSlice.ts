import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiFetch } from "@/lib/api/client";
import type { RootState } from "../index";

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  emailSent: boolean;
  createdAt: string;
}

interface NotificationsState {
  items: Notification[];
  unreadCount: number;
  loading: boolean;
}

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
  loading: false,
};

export const fetchNotifications = createAsyncThunk(
  "notifications/fetch",
  async (_, { getState }) => {
    const token = (getState() as RootState).auth.token;
    return apiFetch<Notification[]>("/notifications", { token });
  },
);

export const fetchUnreadCount = createAsyncThunk(
  "notifications/unreadCount",
  async (_, { getState }) => {
    const token = (getState() as RootState).auth.token;
    const res = await apiFetch<{ count: number }>("/notifications/unread-count", { token });
    return res.count;
  },
);

export const markNotificationRead = createAsyncThunk(
  "notifications/markRead",
  async (id: string, { getState, dispatch }) => {
    const token = (getState() as RootState).auth.token;
    await apiFetch(`/notifications/${id}/read`, { method: "PATCH", token });
    dispatch(fetchUnreadCount());
    return id;
  },
);

export const markAllNotificationsRead = createAsyncThunk(
  "notifications/markAllRead",
  async (_, { getState }) => {
    const token = (getState() as RootState).auth.token;
    await apiFetch("/notifications/read-all", { method: "PATCH", token });
    return true;
  },
);

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.loading = true; })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.isRead).length;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const item = state.items.find((n) => n.id === action.payload);
        if (item) item.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items.forEach((n) => { n.isRead = true; });
        state.unreadCount = 0;
      });
  },
});

export default notificationsSlice.reducer;
