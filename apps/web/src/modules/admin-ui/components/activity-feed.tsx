"use client";

import { motion } from "framer-motion";
import { formatRelativeDate } from "@/lib/format";

const ACTIVITIES = [
  { id: 1, type: "order", message: "New order DM-20260606-001 from Arjun Kumar", time: "2026-06-06T10:30:00", color: "bg-indigo-500" },
  { id: 2, type: "payment", message: "Payment ₹2,249 received via Razorpay", time: "2026-06-06T10:31:00", color: "bg-emerald-500" },
  { id: 3, type: "ship", message: "Order DM-20260605-042 shipped to Delhi", time: "2026-06-06T09:00:00", color: "bg-amber-500" },
  { id: 4, type: "product", message: "Air Fryer 5L stock updated to 34 units", time: "2026-06-06T08:45:00", color: "bg-violet-500" },
  { id: 5, type: "user", message: "New supplier registration: Meera Traders", time: "2026-06-06T08:00:00", color: "bg-rose-500" },
  { id: 6, type: "refund", message: "Refund ₹948 processed for order DM-20260603-091", time: "2026-06-04T10:00:00", color: "bg-orange-500" },
];

export function ActivityFeed() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="admin-glass p-6"
    >
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-semibold">Live Activity</h3>
        <span className="flex items-center gap-1.5 text-xs text-[var(--admin-text-muted)]">
          <span className="admin-live-dot" />
          Real-time
        </span>
      </div>
      <div className="space-y-1">
        {ACTIVITIES.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.07 }}
            className="admin-table-row flex items-start gap-3 rounded-lg px-3 py-2.5"
          >
            <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.color}`} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{item.message}</p>
              <p className="text-[11px] text-[var(--admin-text-muted)]">
                {formatRelativeDate(item.time)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
