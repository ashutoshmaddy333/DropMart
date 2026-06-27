"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMe, refreshSession } from "@/store/slices/authSlice";
import { fetchMasters } from "@/store/slices/mastersSlice";
import { fetchUnreadCount } from "@/store/slices/notificationsSlice";

/** Bootstraps auth/masters in the background — never blocks page render. */
export function AppInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((s) => s.auth);

  useEffect(() => {
    dispatch(fetchMasters());

    async function initSession() {
      try {
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
      } catch {
        // Session bootstrap is best-effort; pages must render without it.
      }
    }

    void initSession();
  }, [dispatch, token]);

  return <>{children}</>;
}
