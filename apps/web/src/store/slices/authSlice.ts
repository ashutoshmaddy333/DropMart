import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiFetch, setAuthSession, clearAuthSession } from "@/lib/api/client";
import type { AuthResponse, AuthUser } from "@/lib/api/types";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  csrfToken: string | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  csrfToken: null,
  loading: false,
  error: null,
  initialized: false,
};

export const login = createAsyncThunk(
  "auth/login",
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      return await apiFetch<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
        skipCsrf: true,
      });
    } catch (e: unknown) {
      return rejectWithValue(e instanceof Error ? e.message : "Login failed");
    }
  },
);

export const registerCustomer = createAsyncThunk(
  "auth/registerCustomer",
  async (data: { name: string; email: string; password: string; phone?: string; otp: string }, { rejectWithValue }) => {
    try {
      return await apiFetch<AuthResponse>("/auth/register/customer", {
        method: "POST",
        body: JSON.stringify(data),
        skipCsrf: true,
      });
    } catch (e: unknown) {
      return rejectWithValue(e instanceof Error ? e.message : "Registration failed");
    }
  },
);

export const registerSupplier = createAsyncThunk(
  "auth/registerSupplier",
  async (
    data: {
      name: string; email: string; password: string;
      businessName: string; warehouseCity: string;
      phone?: string; gstNumber?: string; address?: string; otp: string;
    },
    { rejectWithValue },
  ) => {
    try {
      return await apiFetch<AuthResponse>("/auth/register/supplier", {
        method: "POST",
        body: JSON.stringify(data),
        skipCsrf: true,
      });
    } catch (e: unknown) {
      return rejectWithValue(e instanceof Error ? e.message : "Registration failed");
    }
  },
);

export const fetchMe = createAsyncThunk(
  "auth/fetchMe",
  async (_, { getState, rejectWithValue }) => {
    const token = (getState() as { auth: AuthState }).auth.token;
    try {
      const res = await apiFetch<{ user: AuthUser }>("/auth/me", { token });
      return { user: res.user, accessToken: token!, csrfToken: (getState() as { auth: AuthState }).auth.csrfToken ?? "" };
    } catch {
      return rejectWithValue("Session expired");
    }
  },
);

export const refreshSession = createAsyncThunk(
  "auth/refreshSession",
  async (_, { rejectWithValue }) => {
    try {
      return await apiFetch<AuthResponse>("/auth/refresh", {
        method: "POST",
        skipCsrf: true,
      });
    } catch {
      return rejectWithValue("Session expired");
    }
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST", skipCsrf: true });
    } catch {
      // clear local state even if API call fails
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.csrfToken = null;
      state.error = null;
      state.initialized = true;
      clearAuthSession();
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const handleAuthPending = (state: AuthState) => {
      state.loading = true;
      state.error = null;
    };
    const handleAuthFulfilled = (state: AuthState, action: PayloadAction<AuthResponse>) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.accessToken;
      state.csrfToken = action.payload.csrfToken;
      state.initialized = true;
      setAuthSession({
        accessToken: action.payload.accessToken,
        csrfToken: action.payload.csrfToken,
        role: action.payload.user.role,
      });
    };
    const handleAuthRejected = (state: AuthState, action: { payload: unknown }) => {
      state.loading = false;
      state.error = (action.payload as string) ?? "Error";
      state.initialized = true;
    };

    builder
      .addCase(login.pending, handleAuthPending)
      .addCase(login.fulfilled, handleAuthFulfilled)
      .addCase(login.rejected, handleAuthRejected)
      .addCase(registerCustomer.pending, handleAuthPending)
      .addCase(registerCustomer.fulfilled, handleAuthFulfilled)
      .addCase(registerCustomer.rejected, handleAuthRejected)
      .addCase(registerSupplier.pending, handleAuthPending)
      .addCase(registerSupplier.fulfilled, handleAuthFulfilled)
      .addCase(registerSupplier.rejected, handleAuthRejected)
      .addCase(fetchMe.pending, (state) => { state.loading = true; })
      .addCase(fetchMe.fulfilled, handleAuthFulfilled)
      .addCase(fetchMe.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.csrfToken = null;
        state.initialized = true;
        clearAuthSession();
      })
      .addCase(refreshSession.fulfilled, handleAuthFulfilled)
      .addCase(refreshSession.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.csrfToken = null;
        state.initialized = true;
        clearAuthSession();
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.csrfToken = null;
        state.initialized = true;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
