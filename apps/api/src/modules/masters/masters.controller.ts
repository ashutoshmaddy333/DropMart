import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.module";
import { Public } from "../../common/decorators/auth.decorators";

@Controller("masters")
export class MastersController {
  constructor(private prisma: PrismaService) {}

  @Public()
  @Get()
  async getAll() {
    const [
      roles,
      permissionGroups,
      permissions,
      userStatuses,
      orderStatuses,
      paymentMethods,
      paymentStatuses,
      supplierStatuses,
      productStatuses,
      deliveryStatuses,
      categories,
      settings,
    ] = await Promise.all([
      this.prisma.masterRole.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      this.prisma.masterPermissionGroup.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      this.prisma.masterPermission.findMany({
        where: { isActive: true },
        include: { group: true },
        orderBy: { sortOrder: "asc" },
      }),
      this.prisma.masterUserStatus.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      this.prisma.masterOrderStatus.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      this.prisma.masterPaymentMethod.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      this.prisma.masterPaymentStatus.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      this.prisma.masterSupplierStatus.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      this.prisma.masterProductStatus.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      this.prisma.masterDeliveryStatus.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      this.prisma.masterCategory.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      this.prisma.platformSetting.findMany(),
    ]);

    const rolePermissions = await this.prisma.rolePermission.findMany({
      include: { role: true, permission: true },
    });

    const rbacMatrix = roles.map((role) => ({
      role: role.code,
      roleLabel: role.label,
      permissions: rolePermissions
        .filter((rp) => rp.roleId === role.id)
        .map((rp) => rp.permission.code),
    }));

    return {
      roles: roles.map((r) => ({ code: r.code, label: r.label, description: r.description })),
      permissionGroups: permissionGroups.map((g) => ({
        code: g.code,
        label: g.label,
        description: g.description,
      })),
      permissions: permissions.map((p) => ({
        code: p.code,
        label: p.label,
        description: p.description,
        group: p.group.code,
        groupLabel: p.group.label,
      })),
      rbacMatrix,
      userStatuses: userStatuses.map((s) => ({ code: s.code, label: s.label, color: s.color })),
      orderStatuses: orderStatuses.map((s) => ({ code: s.code, label: s.label, color: s.color, isFinal: s.isFinal })),
      paymentMethods: paymentMethods.map((m) => ({ code: m.code, label: m.label, icon: m.icon })),
      paymentStatuses: paymentStatuses.map((s) => ({ code: s.code, label: s.label, color: s.color })),
      supplierStatuses: supplierStatuses.map((s) => ({ code: s.code, label: s.label, color: s.color })),
      productStatuses: productStatuses.map((s) => ({ code: s.code, label: s.label, color: s.color })),
      deliveryStatuses: deliveryStatuses.map((s) => ({ code: s.code, label: s.label, color: s.color })),
      categories: categories.map((c) => ({ slug: c.slug, name: c.name, description: c.description, image: c.image })),
      settings: Object.fromEntries(settings.map((s) => [s.key, s.value])),
    };
  }
}
