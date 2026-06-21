"use client";

import { RoleBadge } from "@/components/shared/role-badge";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PermissionGate } from "@/components/shared/permission-gate";
import { Permission } from "@/modules/rbac/permissions";
import { Role } from "@/modules/rbac/roles";
import { Button } from "@/components/ui/button";

const DEMO_USERS = [
  { name: "Priya Sharma", email: "priya@dropmart.in", role: Role.SuperAdmin },
  { name: "Rahul Mehta", email: "rahul@dropmart.in", role: Role.Admin },
  { name: "Ananya Patel", email: "ananya@dropmart.in", role: Role.CatalogManager },
  { name: "Vikram Singh", email: "vikram@dropmart.in", role: Role.OrderManager },
  { name: "Deepa Nair", email: "deepa@dropmart.in", role: Role.Finance },
  { name: "Karan Joshi", email: "karan@dropmart.in", role: Role.Support },
  { name: "Meera Traders", email: "meera@supplier.in", role: Role.Supplier },
  { name: "Arjun Kumar", email: "arjun@gmail.com", role: Role.Customer },
];

export function AdminUsersTable() {
  return (
    <>
      <div className="space-y-3 md:hidden">
        {DEMO_USERS.map((user) => (
          <div key={user.email} className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium">{user.name}</p>
                <p className="truncate text-sm text-muted-foreground">{user.email}</p>
              </div>
              <RoleBadge role={user.role} />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700">Active</Badge>
              <PermissionGate require={Permission.UserManage}>
                <Button variant="ghost" size="sm">Edit Role</Button>
              </PermissionGate>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-xl border md:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DEMO_USERS.map((user) => (
                <TableRow key={user.email}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <RoleBadge role={user.role} />
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700">Active</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <PermissionGate require={Permission.UserManage}>
                      <Button variant="ghost" size="sm">Edit Role</Button>
                    </PermissionGate>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
