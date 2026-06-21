"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppSelector } from "@/store/hooks";
import {
  createRole,
  deleteRole,
  fetchPermissions,
  fetchRoles,
  updateRole,
  type RbacPermission,
  type RbacPermissionGroup,
  type RbacRole,
} from "@/lib/api/rbac";
import { cn } from "@/lib/utils";

const EMPTY_FORM = {
  code: "",
  label: "",
  description: "",
  sortOrder: "99",
  permissionIds: [] as string[],
};

export function RolesManager() {
  const { token } = useAppSelector((s) => s.auth);
  const [roles, setRoles] = useState<RbacRole[]>([]);
  const [groups, setGroups] = useState<RbacPermissionGroup[]>([]);
  const [permissions, setPermissions] = useState<RbacPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<RbacRole | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [rolesData, permData] = await Promise.all([
        fetchRoles(token),
        fetchPermissions(token),
      ]);
      setRoles(rolesData);
      setGroups(permData.groups);
      setPermissions(permData.permissions.filter((p) => p.isActive));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load roles");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const permissionsByGroup = useMemo(() => {
    const map = new Map<string, RbacPermission[]>();
    for (const group of groups) map.set(group.id, []);
    for (const perm of permissions) {
      const list = map.get(perm.groupId) ?? [];
      list.push(perm);
      map.set(perm.groupId, list);
    }
    return map;
  }, [groups, permissions]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEdit(role: RbacRole) {
    setEditing(role);
    setForm({
      code: role.code,
      label: role.label,
      description: role.description ?? "",
      sortOrder: String(role.sortOrder),
      permissionIds: [...role.permissionIds],
    });
    setDialogOpen(true);
  }

  function togglePermission(permissionId: string) {
    setForm((prev) => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permissionId)
        ? prev.permissionIds.filter((id) => id !== permissionId)
        : [...prev.permissionIds, permissionId],
    }));
  }

  async function handleSave() {
    if (!token) return;
    if (!form.label.trim()) {
      toast.error("Role label is required");
      return;
    }
    if (!editing && !form.code.trim()) {
      toast.error("Role code is required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        label: form.label.trim(),
        description: form.description.trim() || undefined,
        sortOrder: Number(form.sortOrder) || 99,
        permissionIds: form.permissionIds,
      };

      if (editing) {
        await updateRole(editing.id, payload, token);
        toast.success("Role updated");
      } else {
        await createRole(
          { ...payload, code: form.code.trim().toLowerCase().replace(/\s+/g, "_") },
          token,
        );
        toast.success("Role created");
      }
      setDialogOpen(false);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(role: RbacRole) {
    if (!token) return;
    if (!window.confirm(`Deactivate role "${role.label}"?`)) return;
    try {
      await deleteRole(role.id, token);
      toast.success("Role deactivated");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--admin-text-muted)]">
          Create roles and assign rights (permissions) to each role.
        </p>
        <Button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-500">
          <Plus className="mr-2 h-4 w-4" />
          Add Role
        </Button>
      </div>

      <div className="space-y-3 md:hidden">
        {roles.map((role) => (
          <div key={role.id} className="admin-glass rounded-xl p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Badge variant="outline" className="font-medium">
                  {role.label}
                </Badge>
                <p className="mt-1 font-medium">{role.label}</p>
                <p className="font-mono text-[10px] text-[var(--admin-text-muted)]">{role.code}</p>
              </div>
              <Badge variant={role.isActive ? "default" : "secondary"}>
                {role.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="mt-2 text-xs text-[var(--admin-text-muted)]">
              {role.permissions.length} rights · {role.userCount} users
            </p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => openEdit(role)}>
                <Pencil className="mr-1 h-3 w-3" /> Edit
              </Button>
              <Button size="sm" variant="outline" className="text-red-400" onClick={() => handleDelete(role)}>
                <Trash2 className="mr-1 h-3 w-3" /> Deactivate
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-glass hidden overflow-hidden rounded-xl md:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Rights</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.label}</TableCell>
                  <TableCell>
                    <code className="text-xs text-indigo-400">{role.code}</code>
                  </TableCell>
                  <TableCell>{role.permissions.length}</TableCell>
                  <TableCell>{role.userCount}</TableCell>
                  <TableCell>
                    <Badge variant={role.isActive ? "default" : "secondary"}>
                      {role.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(role)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-400"
                      onClick={() => handleDelete(role)}
                    >
                      Deactivate
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Role" : "Create Role"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {!editing && (
              <div className="space-y-2">
                <Label htmlFor="role-code">Code</Label>
                <Input
                  id="role-code"
                  placeholder="inventory_manager"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Lowercase, use underscores (e.g. order_manager)</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="role-label">Label</Label>
              <Input
                id="role-label"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-desc">Description</Label>
              <Input
                id="role-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-sort">Sort order</Label>
              <Input
                id="role-sort"
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
              />
            </div>

            <div className="space-y-3">
              <Label>Assign Rights (Permissions)</Label>
              {groups.map((group) => {
                const perms = permissionsByGroup.get(group.id) ?? [];
                if (!perms.length) return null;
                return (
                  <div key={group.id} className="rounded-lg border p-3">
                    <p className="mb-2 text-sm font-semibold">{group.label}</p>
                    <div className="space-y-2">
                      {perms.map((perm) => (
                        <label
                          key={perm.id}
                          className={cn(
                            "flex cursor-pointer items-start gap-2 rounded-md p-2 hover:bg-muted/50",
                            form.permissionIds.includes(perm.id) && "bg-indigo-500/10",
                          )}
                        >
                          <Checkbox
                            checked={form.permissionIds.includes(perm.id)}
                            onCheckedChange={() => togglePermission(perm.id)}
                          />
                          <span>
                            <span className="text-sm font-medium">{perm.label}</span>
                            <span className="block font-mono text-[10px] text-muted-foreground">{perm.code}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-500">
              {saving ? "Saving..." : editing ? "Update Role" : "Create Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
