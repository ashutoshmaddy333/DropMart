import { AdminHeaderAdvanced } from "@/modules/admin-ui/layout/admin-header-advanced";
import { AdminUsersTable } from "@/components/admin/users/admin-users-table";

export const metadata = {
  title: "Users",
};

export default function AdminUsersPage() {
  return (
    <>
      <AdminHeaderAdvanced
        title="User Management"
        subtitle="Manage roles and access for all users"
      />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <AdminUsersTable />
      </div>
    </>
  );
}
