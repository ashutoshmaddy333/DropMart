"use client";

import { Icon } from "@/components/shared/icon";
import { MOCK_ORDERS } from "@/modules/orders/data/mock-orders";
import { MOCK_PRODUCTS } from "@/modules/products/data/mock-products";
import { formatCurrency } from "@/lib/format";
import { StatCard3D } from "../components/stat-card-3d";
import { RevenueChart } from "../components/revenue-chart";
import { ActivityFeed } from "../components/activity-feed";
import { motion } from "framer-motion";

export function AdvancedAdminDashboard() {
  const totalRevenue = MOCK_ORDERS.filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + o.total, 0);
  const ordersToday = MOCK_ORDERS.filter((o) =>
    o.createdAt.startsWith("2026-06-06")
  ).length;
  const pendingOrders = MOCK_ORDERS.filter(
    (o) => o.status === "pending" || o.status === "processing"
  ).length;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Stat cards bento grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard3D
          label="Total Revenue"
          value={totalRevenue}
          prefix="₹"
          change="+12.5% vs last week"
          changeType="up"
          glow="indigo"
          delay={0}
          icon={<Icon name="chart-bar" size={20} />}
        />
        <StatCard3D
          label="Orders Today"
          value={ordersToday}
          change="+3 from yesterday"
          changeType="up"
          glow="emerald"
          delay={0.08}
          icon={<Icon name="shopping-cart" size={20} />}
        />
        <StatCard3D
          label="Active Products"
          value={MOCK_PRODUCTS.length}
          change="+2 this week"
          changeType="up"
          glow="amber"
          delay={0.16}
          icon={<Icon name="cube" size={20} />}
        />
        <StatCard3D
          label="Pending Orders"
          value={pendingOrders}
          change="Needs attention"
          changeType="neutral"
          glow="rose"
          delay={0.24}
          icon={<Icon name="bell" size={20} />}
        />
      </div>

      {/* Charts + Activity */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <RevenueChart />
        </div>
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>
      </div>

      {/* Recent orders bento */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="admin-glass p-6"
        >
          <h3 className="mb-4 font-semibold">Recent Orders</h3>
          <div className="space-y-2">
            {MOCK_ORDERS.slice(0, 5).map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + i * 0.06 }}
                className="admin-table-row flex items-center justify-between rounded-lg px-3 py-2.5"
              >
                <div>
                  <p className="font-mono text-xs font-medium text-indigo-400">
                    {order.orderNumber}
                  </p>
                  <p className="text-sm">{order.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(order.total)}</p>
                  <p className="text-[11px] capitalize text-[var(--admin-text-muted)]">
                    {order.status}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="admin-glass p-6"
        >
          <h3 className="mb-4 font-semibold">Top Products</h3>
          <div className="space-y-2">
            {MOCK_PRODUCTS.slice(0, 5).map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.06 }}
                className="admin-table-row flex items-center justify-between rounded-lg px-3 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium">{product.name}</p>
                  <p className="text-[11px] text-[var(--admin-text-muted)]">
                    {product.category}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(product.price)}</p>
                  <p className="text-[11px] text-amber-400">★ {product.rating}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
