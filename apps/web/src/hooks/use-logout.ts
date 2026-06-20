"use client";

import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { logout, logoutUser } from "@/store/slices/authSlice";

export function useLogout() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  return async function handleLogout() {
    await dispatch(logoutUser());
    dispatch(logout());
    router.push("/login");
  };
}
