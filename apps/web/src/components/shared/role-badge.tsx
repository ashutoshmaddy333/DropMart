import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS, type Role } from "@/modules/rbac/roles";
import { cn } from "@/lib/utils";

const ROLE_COLORS: Record<Role, string> = {
  superadmin: "bg-violet-100 text-violet-800 border-violet-200",
  admin: "bg-blue-100 text-blue-800 border-blue-200",
  catalog_manager: "bg-emerald-100 text-emerald-800 border-emerald-200",
  order_manager: "bg-amber-100 text-amber-800 border-amber-200",
  finance: "bg-cyan-100 text-cyan-800 border-cyan-200",
  support: "bg-orange-100 text-orange-800 border-orange-200",
  supplier: "bg-pink-100 text-pink-800 border-pink-200",
  customer: "bg-slate-100 text-slate-700 border-slate-200",
};

export function RoleBadge({ role, className }: { role: Role; className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", ROLE_COLORS[role], className)}
    >
      {ROLE_LABELS[role]}
    </Badge>
  );
}
