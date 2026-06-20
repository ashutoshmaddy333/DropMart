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
    <div className="rounded-xl border">
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
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                  Active
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <PermissionGate require={Permission.UserManage}>
                  <Button variant="ghost" size="sm">
                    Edit Role
                  </Button>
                </PermissionGate>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
