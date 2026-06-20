"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RoleBadge } from "@/components/shared/role-badge";
import { useSession } from "@/modules/auth/session-context";

export function AccountProfileView() {
  const { user } = useSession();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="rounded-xl border bg-card p-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-700">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-semibold">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <RoleBadge role={user.role} className="mt-1" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" defaultValue={user.name} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue={user.email} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" placeholder="+91 98765 43210" />
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700">Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
