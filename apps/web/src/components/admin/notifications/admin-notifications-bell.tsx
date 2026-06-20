"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/shared/icon";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/store/slices/notificationsSlice";
import { cn } from "@/lib/utils";

export function AdminNotificationsBell() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { items, unreadCount } = useAppSelector((s) => s.notifications);
  const { token, user } = useAppSelector((s) => s.auth);
  const [open, setOpen] = useState(false);

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  useEffect(() => {
    if (!token || !isAdmin) return;
    dispatch(fetchUnreadCount());
    const interval = setInterval(() => dispatch(fetchUnreadCount()), 30000);
    return () => clearInterval(interval);
  }, [dispatch, token, isAdmin]);

  useEffect(() => {
    if (open && token) dispatch(fetchNotifications());
  }, [open, dispatch, token]);

  if (!isAdmin) return null;

  async function handleClick(id: string, link: string | null) {
    await dispatch(markNotificationRead(id));
    setOpen(false);
    if (link) router.push(link);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] transition-colors hover:bg-[var(--admin-surface-hover)]"
      >
        <Icon name="bell" size={16} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-xl border border-[var(--admin-border)] bg-[#12121a] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--admin-border)] bg-[#12121a] px-4 py-3">
              <span className="text-sm font-semibold text-white">Notifications</span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => dispatch(markAllNotificationsRead())}
                  className="text-xs text-indigo-400 hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {items.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-[var(--admin-text-muted)]">
                  No notifications yet
                </p>
              ) : (
                items.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => handleClick(n.id, n.link)}
                    className={cn(
                      "flex w-full flex-col gap-0.5 border-b border-[var(--admin-border)] px-4 py-3 text-left transition-colors hover:bg-white/5",
                      !n.isRead && "bg-indigo-500/15",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-semibold text-white">{n.title}</span>
                      {!n.isRead && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-rose-500" />}
                    </div>
                    <p className="text-xs leading-relaxed text-gray-300 line-clamp-3">{n.message}</p>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-[var(--admin-text-muted)]">
                      <span>{new Date(n.createdAt).toLocaleString()}</span>
                      {n.emailSent && <span className="text-emerald-500">✉ Sent</span>}
                    </div>
                  </button>
                ))
              )}
            </div>
            <div className="border-t border-[var(--admin-border)] p-2">
              <Link
                href="/admin/notifications"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-center text-xs text-indigo-400 hover:bg-[var(--admin-surface-hover)]"
              >
                View all notifications
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
