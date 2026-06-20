import type { Metadata } from "next";
import { RegisterSupplierForm } from "@/components/auth/register-supplier-form";

export const metadata: Metadata = { title: "Register as Supplier" };

export default function RegisterSupplierPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <RegisterSupplierForm />
    </div>
  );
}
