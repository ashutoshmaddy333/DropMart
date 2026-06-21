"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  createPermission,
  deletePermission,
  fetchPermissions,
  updatePermission,
  type RbacPermission,
  type RbacPermissionGroup,
} from "@/lib/api/rbac";

const EMPTY_FORM = {
  code: "",
  label: "",
  description: "",
  groupId: "",
  sortOrder: "99",
};

export function PermissionsManager() {
  const { token } = useAppSelector((s) => s.auth);
  const [groups, setGroups] = useState<RbacPermissionGroup[]>([]);
  const [permissions, setPermissions] = useState<RbacPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<RbacPermission | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await fetchPermissions(token);
      setGroups(data.groups);
      setPermissions(data.permissions);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load rights");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const grouped = useMemo(() => {
    const map = new Map<string, RbacPermission[]>();
    for (const group of groups) map.set(group.id, []);
    for (const perm of permissions) {
      const list = map.get(perm.groupId) ?? [];
      list.push(perm);
      map.set(perm.groupId, list);
    }
    return groups.map((g) => ({ group: g, permissions: map.get(g.id) ?? [] }));
  }, [groups, permissions]);

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM, groupId: groups[0]?.id ?? "" });
    setDialogOpen(true);
  }

  function openEdit(perm: RbacPermission) {
    setEditing(perm);
    setForm({
      code: perm.code,
      label: perm.label,
      description: perm.description ?? "",
      groupId: perm.groupId,
      sortOrder: String(perm.sortOrder),
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!token) return;
    if (!form.label.trim() || !form.groupId) {
      toast.error("Label and group are required");
      return;
    }
    if (!editing && !form.code.trim()) {
      toast.error("Permission code is required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        label: form.label.trim(),
        description: form.description.trim() || undefined,
        groupId: form.groupId,
        sortOrder: Number(form.sortOrder) || 99,
      };

      if (editing) {
        await updatePermission(editing.id, payload, token);
        toast.success("Right updated");
      } else {
        await createPermission(
          { ...payload, code: form.code.trim().toLowerCase() },
          token,
        );
        toast.success("Right created");
      }
      setDialogOpen(false);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(perm: RbacPermission) {
    if (!token) return;
    if (!window.confirm(`Deactivate right "${perm.label}"?`)) return;
    try {
      await deletePermission(perm.id, token);
      toast.success("Right deactivated");
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
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--admin-text-muted)]">
          Manage rights (permissions) that can be assigned to roles.
        </p>
        <Button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-500">
          <Plus className="mr-2 h-4 w-4" />
          Add Right
        </Button>
      </div>

      {grouped.map(({ group, permissions: perms }) => (
        <section key={group.id} className="admin-glass rounded-xl p-4 sm:p-5">
          <div className="mb-4">
            <h3 className="font-semibold">{group.label}</h3>
            {group.description && (
              <p className="text-xs text-[var(--admin-text-muted)]">{group.description}</p>
            )}
          </div>

          <div className="space-y-2 md:hidden">
            {perms.map((perm) => (
              <div key={perm.id} className="rounded-lg border border-[var(--admin-border)] p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{perm.label}</p>
                    <p className="font-mono text-[10px] text-indigo-400">{perm.code}</p>
                  </div>
                  <Badge variant={perm.isActive ? "outline" : "secondary"}>
                    {perm.isActive ? "Active" : "Off"}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-[var(--admin-text-muted)]">{perm.roleCount} roles</p>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(perm)}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-400" onClick={() => handleDelete(perm)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            {!perms.length && <p className="text-sm text-muted-foreground">No rights in this group</p>}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Right</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {perms.map((perm) => (
                  <TableRow key={perm.id}>
                    <TableCell>
                      <p className="font-medium">{perm.label}</p>
                      {perm.description && (
                        <p className="text-xs text-muted-foreground">{perm.description}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs text-indigo-400">{perm.code}</code>
                    </TableCell>
                    <TableCell>{perm.roleCount}</TableCell>
                    <TableCell>
                      <Badge variant={perm.isActive ? "default" : "secondary"}>
                        {perm.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(perm)}>Edit</Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-400"
                        onClick={() => handleDelete(perm)}
                      >
                        Deactivate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      ))}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Right" : "Create Right"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {!editing && (
              <div className="space-y-2">
                <Label htmlFor="perm-code">Code</Label>
                <Input
                  id="perm-code"
                  placeholder="product:approve"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="perm-label">Label</Label>
              <Input
                id="perm-label"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="perm-desc">Description</Label>
              <Input
                id="perm-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Group</Label>
              <Select value={form.groupId} onValueChange={(v) => setForm({ ...form, groupId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>{g.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="perm-sort">Sort order</Label>
              <Input
                id="perm-sort"
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-500">
              {saving ? "Saving..." : editing ? "Update Right" : "Create Right"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
