import { SupplierShell } from "@/modules/supplier-ui/layout/supplier-shell";

export default function SupplierLayout({ children }: { children: React.ReactNode }) {
  return <SupplierShell>{children}</SupplierShell>;
}
