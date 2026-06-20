"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon, type IconName } from "@/components/shared/icon";
import { MOCK_ORDERS } from "@/modules/orders/data/mock-orders";
import { MOCK_PRODUCTS } from "@/modules/products/data/mock-products";
import { formatCurrency } from "@/lib/format";

const STATS = [
  {
    label: "Total Revenue",
    value: formatCurrency(
      MOCK_ORDERS.filter((o) => o.paymentStatus === "paid").reduce(
        (sum, o) => sum + o.total,
        0
      )
    ),
    icon: "chart-bar" as IconName,
    change: "+12.5%",
  },
  {
    label: "Orders Today",
    value: MOCK_ORDERS.filter((o) => o.createdAt.startsWith("2026-06-06")).length.toString(),
    icon: "shopping-cart" as IconName,
    change: "+3",
  },
  {
    label: "Active Products",
    value: MOCK_PRODUCTS.length.toString(),
    icon: "cube" as IconName,
    change: "+2",
  },
  {
    label: "Pending Orders",
    value: MOCK_ORDERS.filter((o) => o.status === "pending" || o.status === "processing").length.toString(),
    icon: "bell" as IconName,
    change: "Needs attention",
  },
];

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <Icon name={stat.icon} size={18} className="opacity-50" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_ORDERS.slice(0, 4).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-mono text-sm font-medium">{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">{order.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(order.total)}</p>
                  <p className="text-xs capitalize text-muted-foreground">{order.status}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_PRODUCTS.slice(0, 4).map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="text-sm font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(product.price)}</p>
                  <p className="text-xs text-muted-foreground">
                    ★ {product.rating} ({product.reviewCount})
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
