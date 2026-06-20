import type { Metadata } from "next";
import { RegisterCustomerForm } from "@/components/auth/register-customer-form";

export const metadata: Metadata = { title: "Create Account" };

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <RegisterCustomerForm />
    </div>
  );
}
