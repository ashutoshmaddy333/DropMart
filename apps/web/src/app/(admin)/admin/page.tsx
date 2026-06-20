import { AdminHeaderAdvanced } from "@/modules/admin-ui/layout/admin-header-advanced";
import { AdvancedAdminDashboard } from "@/modules/admin-ui/pages/advanced-dashboard";

export default function AdminDashboardPage() {
  return (
    <>
      <AdminHeaderAdvanced title="Dashboard" subtitle="Welcome back — here's what's happening" />
      <div className="flex-1 overflow-y-auto">
        <AdvancedAdminDashboard />
      </div>
    </>
  );
}
