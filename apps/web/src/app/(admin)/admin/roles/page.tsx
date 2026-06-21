import { AdminHeaderAdvanced } from "@/modules/admin-ui/layout/admin-header-advanced";
import { RolesManager } from "@/components/admin/rbac/roles-manager";

export const metadata = {
  title: "Roles",
};

export default function AdminRolesPage() {
  return (
    <>
      <AdminHeaderAdvanced
        title="Roles"
        subtitle="Create roles and assign rights to each role"
      />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <RolesManager />
      </div>
    </>
  );
}
