"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoleBadge } from "@/components/shared/role-badge";
import {
  PERMISSION_GROUPS,
  PERMISSION_LABELS,
  Permission,
} from "@/modules/rbac/permissions";
import { ROLE_LABELS, Role } from "@/modules/rbac/roles";
import { ROLE_PERMISSIONS } from "@/modules/rbac/role-permissions.map";
import { cn } from "@/lib/utils";

const ADMIN_ROLES_LIST = [
  Role.SuperAdmin,
  Role.Admin,
  Role.CatalogManager,
  Role.OrderManager,
  Role.Finance,
  Role.Support,
  Role.Supplier,
];

export function RbacMatrix() {
  return (
    <Tabs defaultValue="matrix" className="space-y-6">
      <TabsList>
        <TabsTrigger value="matrix">Permission Matrix</TabsTrigger>
        <TabsTrigger value="roles">Role Overview</TabsTrigger>
        <TabsTrigger value="groups">Permission Groups</TabsTrigger>
      </TabsList>

      <TabsContent value="matrix">
        <div className="overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 z-10 min-w-[200px] bg-background">
                  Permission
                </TableHead>
                {ADMIN_ROLES_LIST.map((role) => (
                  <TableHead key={role} className="min-w-[100px] text-center text-xs">
                    {ROLE_LABELS[role].split(" ")[0]}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.values(Permission).map((perm) => (
                <TableRow key={perm}>
                  <TableCell className="sticky left-0 z-10 bg-background">
                    <div>
                      <p className="text-sm font-medium">{PERMISSION_LABELS[perm]}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">{perm}</p>
                    </div>
                  </TableCell>
                  {ADMIN_ROLES_LIST.map((role) => {
                    const granted = ROLE_PERMISSIONS[role].includes(perm);
                    return (
                      <TableCell key={role} className="text-center">
                        <Checkbox
                          checked={granted}
                          disabled
                          className={cn(
                            granted && "border-emerald-500 data-[state=checked]:bg-emerald-500"
                          )}
                        />
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      <TabsContent value="roles">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.values(Role).map((role) => (
            <div key={role} className="rounded-xl border p-5">
              <div className="mb-3 flex items-center justify-between">
                <RoleBadge role={role} />
                <Badge variant="secondary">
                  {ROLE_PERMISSIONS[role].length} perms
                </Badge>
              </div>
              <ul className="space-y-1">
                {ROLE_PERMISSIONS[role].slice(0, 6).map((p) => (
                  <li key={p} className="text-xs text-muted-foreground">
                    • {PERMISSION_LABELS[p]}
                  </li>
                ))}
                {ROLE_PERMISSIONS[role].length > 6 && (
                  <li className="text-xs text-muted-foreground">
                    + {ROLE_PERMISSIONS[role].length - 6} more...
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="groups">
        <div className="grid gap-4 md:grid-cols-2">
          {PERMISSION_GROUPS.map((group) => (
            <div key={group.label} className="rounded-xl border p-5">
              <h3 className="mb-3 font-semibold">{group.label}</h3>
              <div className="flex flex-wrap gap-2">
                {group.permissions.map((p) => (
                  <Badge key={p} variant="outline" className="text-xs">
                    {PERMISSION_LABELS[p]}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}
