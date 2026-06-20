import { AdminHeaderAdvanced } from "@/modules/admin-ui/layout/admin-header-advanced";

export const metadata = { title: "Settings" };

export default function AdminSettingsPage() {
  return (
    <>
      <AdminHeaderAdvanced title="Platform Settings" subtitle="Configure DropMart platform options" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {[
            { label: "Site Name", value: "DropMart", type: "text" },
            { label: "Support Email", value: "support@dropmart.in", type: "email" },
            { label: "Free Shipping Threshold (₹)", value: "999", type: "number" },
            { label: "Default Currency", value: "INR", type: "text" },
            { label: "Razorpay Mode", value: "live", type: "select" },
          ].map((field) => (
            <div key={field.label} className="admin-glass rounded-xl p-5">
              <label className="mb-2 block text-sm font-medium text-[var(--admin-text-muted)]">
                {field.label}
              </label>
              <input
                type={field.type}
                defaultValue={field.value}
                className="w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--admin-text)]"
              />
            </div>
          ))}
          <button
            type="button"
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Save Settings
          </button>
        </div>
      </div>
    </>
  );
}
