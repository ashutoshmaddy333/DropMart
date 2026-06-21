import { AdminHeaderAdvanced } from "@/modules/admin-ui/layout/admin-header-advanced";
import { PermissionsManager } from "@/components/admin/rbac/permissions-manager";

export const metadata = {
  title: "Rights",
};

export default function AdminRightsPage() {
  return (
    <>
      <AdminHeaderAdvanced
        title="Rights"
        subtitle="Manage permissions (rights) available across the platform"
      />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <PermissionsManager />
      </div>
    </>
  );
}
