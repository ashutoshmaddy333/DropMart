"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

const DATA = [
  { day: "Mon", revenue: 42000, orders: 38 },
  { day: "Tue", revenue: 58000, orders: 52 },
  { day: "Wed", revenue: 45000, orders: 41 },
  { day: "Thu", revenue: 72000, orders: 64 },
  { day: "Fri", revenue: 68000, orders: 58 },
  { day: "Sat", revenue: 95000, orders: 82 },
  { day: "Sun", revenue: 88000, orders: 76 },
];

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; dataKey: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="admin-glass rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="font-medium text-[var(--admin-text)]">{label}</p>
      <p className="text-indigo-400">
        ₹{payload[0]?.value.toLocaleString("en-IN")}
      </p>
      <p className="text-[var(--admin-text-muted)]">
        {payload[1]?.value} orders
      </p>
    </div>
  );
}

export function RevenueChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="admin-glass p-6"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Revenue Overview</h3>
          <p className="text-xs text-[var(--admin-text-muted)]">Last 7 days</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="admin-live-dot" />
          <span className="text-xs text-emerald-400">Live</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="day"
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#revenueGrad)"
            dot={false}
            activeDot={{ r: 5, fill: "#6366f1", stroke: "#0a0a0f", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
