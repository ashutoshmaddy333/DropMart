import { Controller, Get, UseGuards } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.module";
import { AuthGuard } from "../../common/guards/auth.guard";
import { RequirePermissions } from "../../common/decorators/auth.decorators";

@Controller("users")
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @RequirePermissions("user:manage")
  async list() {
    const users = await this.prisma.user.findMany({
      include: { role: true, supplier: { include: { status: true } } },
      orderBy: { createdAt: "desc" },
    });
    return users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role.code,
      roleLabel: u.role.label,
      isActive: u.isActive,
      supplier: u.supplier ? { businessName: u.supplier.businessName, status: u.supplier.status.code } : null,
      createdAt: u.createdAt,
    }));
  }
}
