import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.module";
import {
  CreatePermissionDto,
  CreateRoleDto,
  SetRolePermissionsDto,
  UpdatePermissionDto,
  UpdateRoleDto,
} from "./dto/rbac.dto";

const PROTECTED_ROLES = new Set(["superadmin", "customer"]);

@Injectable()
export class RbacService {
  constructor(private prisma: PrismaService) {}

  async listRoles() {
    const roles = await this.prisma.masterRole.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        rolePermissions: { include: { permission: true } },
        _count: { select: { users: true } },
      },
    });

    return roles.map((role) => ({
      id: role.id,
      code: role.code,
      label: role.label,
      description: role.description,
      isActive: role.isActive,
      sortOrder: role.sortOrder,
      userCount: role._count.users,
      permissions: role.rolePermissions.map((rp) => ({
        id: rp.permission.id,
        code: rp.permission.code,
        label: rp.permission.label,
      })),
      permissionIds: role.rolePermissions.map((rp) => rp.permissionId),
    }));
  }

  async getRole(id: string) {
    const role = await this.prisma.masterRole.findUnique({
      where: { id },
      include: {
        rolePermissions: { include: { permission: true } },
        _count: { select: { users: true } },
      },
    });
    if (!role) throw new NotFoundException("Role not found");
    return {
      id: role.id,
      code: role.code,
      label: role.label,
      description: role.description,
      isActive: role.isActive,
      sortOrder: role.sortOrder,
      userCount: role._count.users,
      permissionIds: role.rolePermissions.map((rp) => rp.permissionId),
      permissions: role.rolePermissions.map((rp) => ({
        id: rp.permission.id,
        code: rp.permission.code,
        label: rp.permission.label,
      })),
    };
  }

  async createRole(dto: CreateRoleDto, grantedBy?: string) {
    const existing = await this.prisma.masterRole.findUnique({ where: { code: dto.code } });
    if (existing) throw new ConflictException("Role code already exists");

    const role = await this.prisma.masterRole.create({
      data: {
        code: dto.code,
        label: dto.label,
        description: dto.description,
        sortOrder: dto.sortOrder ?? 99,
      },
    });

    if (dto.permissionIds?.length) {
      await this.replaceRolePermissions(role.id, { permissionIds: dto.permissionIds }, grantedBy);
    }

    return this.getRole(role.id);
  }

  async updateRole(id: string, dto: UpdateRoleDto, grantedBy?: string) {
    const role = await this.prisma.masterRole.findUnique({ where: { id } });
    if (!role) throw new NotFoundException("Role not found");

    if (PROTECTED_ROLES.has(role.code) && dto.isActive === false) {
      throw new BadRequestException(`Cannot deactivate protected role: ${role.code}`);
    }

    await this.prisma.masterRole.update({
      where: { id },
      data: {
        label: dto.label,
        description: dto.description,
        sortOrder: dto.sortOrder,
        isActive: dto.isActive,
      },
    });

    if (dto.permissionIds) {
      await this.replaceRolePermissions(id, { permissionIds: dto.permissionIds }, grantedBy);
    }

    return this.getRole(id);
  }

  async deleteRole(id: string) {
    const role = await this.prisma.masterRole.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });
    if (!role) throw new NotFoundException("Role not found");
    if (PROTECTED_ROLES.has(role.code)) {
      throw new BadRequestException(`Cannot delete protected role: ${role.code}`);
    }
    if (role._count.users > 0) {
      throw new BadRequestException("Cannot delete role assigned to users. Deactivate instead.");
    }

    await this.prisma.masterRole.update({
      where: { id },
      data: { isActive: false },
    });
    return { success: true };
  }

  async replaceRolePermissions(roleId: string, dto: SetRolePermissionsDto, grantedBy?: string) {
    const role = await this.prisma.masterRole.findUnique({ where: { id: roleId } });
    if (!role) throw new NotFoundException("Role not found");

    const permissions = await this.prisma.masterPermission.findMany({
      where: { id: { in: dto.permissionIds }, isActive: true },
    });
    if (permissions.length !== dto.permissionIds.length) {
      throw new BadRequestException("One or more permission IDs are invalid");
    }

    await this.prisma.$transaction([
      this.prisma.rolePermission.deleteMany({ where: { roleId } }),
      this.prisma.rolePermission.createMany({
        data: dto.permissionIds.map((permissionId) => ({
          roleId,
          permissionId,
          grantedBy,
        })),
      }),
    ]);

    return this.getRole(roleId);
  }

  async listPermissions() {
    const [permissions, groups] = await Promise.all([
      this.prisma.masterPermission.findMany({
        orderBy: [{ group: { sortOrder: "asc" } }, { sortOrder: "asc" }],
        include: {
          group: true,
          _count: { select: { rolePermissions: true } },
        },
      }),
      this.prisma.masterPermissionGroup.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
    ]);

    return {
      groups: groups.map((g) => ({
        id: g.id,
        code: g.code,
        label: g.label,
        description: g.description,
      })),
      permissions: permissions.map((p) => ({
        id: p.id,
        code: p.code,
        label: p.label,
        description: p.description,
        isActive: p.isActive,
        sortOrder: p.sortOrder,
        groupId: p.groupId,
        groupCode: p.group.code,
        groupLabel: p.group.label,
        roleCount: p._count.rolePermissions,
      })),
    };
  }

  async createPermission(dto: CreatePermissionDto) {
    const existing = await this.prisma.masterPermission.findUnique({ where: { code: dto.code } });
    if (existing) throw new ConflictException("Permission code already exists");

    const group = await this.prisma.masterPermissionGroup.findUnique({ where: { id: dto.groupId } });
    if (!group) throw new NotFoundException("Permission group not found");

    return this.prisma.masterPermission.create({
      data: {
        code: dto.code,
        label: dto.label,
        description: dto.description,
        groupId: dto.groupId,
        sortOrder: dto.sortOrder ?? 99,
      },
      include: { group: true },
    });
  }

  async updatePermission(id: string, dto: UpdatePermissionDto) {
    const perm = await this.prisma.masterPermission.findUnique({ where: { id } });
    if (!perm) throw new NotFoundException("Permission not found");

    if (dto.groupId) {
      const group = await this.prisma.masterPermissionGroup.findUnique({ where: { id: dto.groupId } });
      if (!group) throw new NotFoundException("Permission group not found");
    }

    return this.prisma.masterPermission.update({
      where: { id },
      data: {
        label: dto.label,
        description: dto.description,
        groupId: dto.groupId,
        sortOrder: dto.sortOrder,
        isActive: dto.isActive,
      },
      include: { group: true },
    });
  }

  async deletePermission(id: string) {
    const perm = await this.prisma.masterPermission.findUnique({
      where: { id },
      include: { _count: { select: { rolePermissions: true } } },
    });
    if (!perm) throw new NotFoundException("Permission not found");

    await this.prisma.masterPermission.update({
      where: { id },
      data: { isActive: false },
    });
    return { success: true };
  }
}
