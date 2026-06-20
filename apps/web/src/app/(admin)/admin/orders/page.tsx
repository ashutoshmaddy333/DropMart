import { AdminHeaderAdvanced } from "@/modules/admin-ui/layout/admin-header-advanced";
import { AdminOrdersTable } from "@/components/admin/orders/admin-orders-table";

export const metadata = {
  title: "Orders",
};

export default function AdminOrdersPage() {
  return (
    <>
      <AdminHeaderAdvanced
        title="Order Management"
        subtitle="Track, process, and fulfill customer orders"
      />
      <div className="flex-1 overflow-y-auto p-6">
        <AdminOrdersTable />
      </div>
    </>
  );
}
