import { AdminHeaderAdvanced } from "@/modules/admin-ui/layout/admin-header-advanced";
import { RbacMatrix } from "@/components/admin/rbac/rbac-matrix";

export const metadata = {
  title: "RBAC Management",
};

export default function AdminRbacPage() {
  return (
    <>
      <AdminHeaderAdvanced
        title="Role-Based Access Control"
        subtitle="Interactive permission matrix for all roles"
      />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <RbacMatrix />
      </div>
    </>
  );
}
