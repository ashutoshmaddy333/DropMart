"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchNotifications, markAllNotificationsRead } from "@/store/slices/notificationsSlice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function AdminNotificationsPage() {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((s) => s.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Supplier registrations and product submissions</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => dispatch(markAllNotificationsRead())}>
          Mark all read
        </Button>
      </div>

      <div className="space-y-3">
        {items.map((n) => (
          <div
            key={n.id}
            className={cn(
              "rounded-xl border p-4 transition-colors",
              !n.isRead ? "border-brand/30 bg-brand/5" : "bg-card",
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{n.title}</h3>
                  <Badge variant={n.type === "supplier_registered" ? "secondary" : "default"}>
                    {n.type === "supplier_registered" ? "Supplier" : "Product"}
                  </Badge>
                  {n.emailSent && <Badge variant="outline" className="text-emerald-600">Email sent</Badge>}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
                <p className="mt-2 text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              {n.link && (
                <Button size="sm" asChild>
                  <Link href={n.link}>Review</Link>
                </Button>
              )}
            </div>
          </div>
        ))}
        {!items.length && (
          <p className="py-12 text-center text-muted-foreground">No notifications yet</p>
        )}
      </div>
    </div>
  );
}
