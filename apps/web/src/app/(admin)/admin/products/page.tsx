import { AdminHeaderAdvanced } from "@/modules/admin-ui/layout/admin-header-advanced";
import { AdminProductsApproval } from "@/components/admin/products/admin-products-approval";

export const metadata = {
  title: "Products",
};

export default function AdminProductsPage() {
  return (
    <>
      <AdminHeaderAdvanced
        title="Product Approval"
        subtitle="Review supplier submissions and publish to storefront"
      />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <AdminProductsApproval />
      </div>
    </>
  );
}
