"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMe, refreshSession } from "@/store/slices/authSlice";
import { fetchMasters } from "@/store/slices/mastersSlice";
import { fetchUnreadCount } from "@/store/slices/notificationsSlice";
import { useMounted } from "@/hooks/use-mounted";

export function AppInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { token, initialized, loading } = useAppSelector((s) => s.auth);
  const mounted = useMounted();
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    dispatch(fetchMasters());

    async function initSession() {
      if (token) {
        const result = await dispatch(fetchMe());
        if (fetchMe.fulfilled.match(result)) {
          const role = result.payload.user.role;
          if (role === "admin" || role === "superadmin" || role === "supplier" || role === "delivery") {
            dispatch(fetchUnreadCount());
          }
        }
      } else {
        const refreshed = await dispatch(refreshSession());
        if (refreshSession.fulfilled.match(refreshed)) {
          const role = refreshed.payload.user.role;
          if (role === "admin" || role === "superadmin" || role === "supplier" || role === "delivery") {
            dispatch(fetchUnreadCount());
          }
        }
      }
      setSessionChecked(true);
    }

    initSession();
  }, [dispatch, token]);

  if (mounted && !sessionChecked && loading && !initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
