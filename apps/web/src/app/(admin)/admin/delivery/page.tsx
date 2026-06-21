import { AdminHeaderAdvanced } from "@/modules/admin-ui/layout/admin-header-advanced";
import { AdminDeliveryPanel } from "@/components/admin/delivery/admin-delivery-panel";
import { AdminLiveFleetMap } from "@/components/admin/delivery/admin-live-fleet-map";

export const metadata = {
  title: "Delivery Tracking",
};

export default function AdminDeliveryPage() {
  return (
    <>
      <AdminHeaderAdvanced
        title="Live Delivery"
        subtitle="Assign delivery partners and enable real-time GPS tracking"
      />
      <div className="flex-1 space-y-8 overflow-y-auto p-4 sm:p-6">
        <AdminLiveFleetMap />
        <AdminDeliveryPanel />
      </div>
    </>
  );
}
