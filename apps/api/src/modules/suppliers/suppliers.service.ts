import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.module";

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async getMySupplier(userId: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { userId },
      include: { status: true, user: { select: { name: true, email: true, phone: true } } },
    });
    if (!supplier) throw new NotFoundException("Supplier profile not found");
    return this.formatSupplier(supplier);
  }

  async getDashboard(userId: string) {
    const supplier = await this.prisma.supplier.findUnique({ where: { userId } });
    if (!supplier) throw new NotFoundException("Supplier profile not found");

    const [products, orders, pendingProducts] = await Promise.all([
      this.prisma.product.count({ where: { supplierId: supplier.id } }),
      this.prisma.order.count({ where: { supplierId: supplier.id } }),
      this.prisma.product.count({
        where: {
          supplierId: supplier.id,
          status: { code: "pending_approval" },
        },
      }),
    ]);

    const recentOrders = await this.prisma.order.findMany({
      where: { supplierId: supplier.id },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        status: true,
        paymentStatus: true,
        customer: { select: { name: true } },
      },
    });

    return {
      stats: { totalProducts: products, totalOrders: orders, pendingApproval: pendingProducts },
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customer.name,
        total: Number(o.total),
        status: o.status.code,
        statusLabel: o.status.label,
        paymentStatus: o.paymentStatus.code,
        createdAt: o.createdAt,
      })),
    };
  }

  async listAll() {
    const suppliers = await this.prisma.supplier.findMany({
      include: { status: true, user: { select: { name: true, email: true, phone: true } } },
      orderBy: { createdAt: "desc" },
    });
    return suppliers.map((s) => this.formatSupplier(s));
  }

  async listPending() {
    const suppliers = await this.prisma.supplier.findMany({
      where: { status: { code: "pending_verification" } },
      include: { status: true, user: { select: { name: true, email: true, phone: true } } },
      orderBy: { createdAt: "desc" },
    });
    return suppliers.map((s) => this.formatSupplier(s));
  }

  async verify(supplierId: string, action: "verify" | "reject", adminId: string, note?: string) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id: supplierId } });
    if (!supplier) throw new NotFoundException("Supplier not found");

    const statusCode = action === "verify" ? "verified" : "rejected";
    const status = await this.prisma.masterSupplierStatus.findUnique({ where: { code: statusCode } });
    if (!status) throw new BadRequestException("Invalid status");

    const updated = await this.prisma.supplier.update({
      where: { id: supplierId },
      data: {
        statusId: status.id,
        verifiedAt: action === "verify" ? new Date() : null,
        verifiedById: action === "verify" ? adminId : null,
        rejectionNote: action === "reject" ? note : null,
      },
      include: { status: true, user: { select: { name: true, email: true, phone: true } } },
    });

    return this.formatSupplier(updated);
  }

  private formatSupplier(supplier: {
    id: string;
    businessName: string;
    warehouseCity: string;
    gstNumber: string | null;
    address: string | null;
    verifiedAt: Date | null;
    rejectionNote: string | null;
    createdAt: Date;
    status: { code: string; label: string; color: string | null };
    user: { name: string; email: string; phone: string | null };
  }) {
    return {
      id: supplier.id,
      businessName: supplier.businessName,
      warehouseCity: supplier.warehouseCity,
      gstNumber: supplier.gstNumber,
      address: supplier.address,
      status: supplier.status.code,
      statusLabel: supplier.status.label,
      statusColor: supplier.status.color,
      verifiedAt: supplier.verifiedAt,
      rejectionNote: supplier.rejectionNote,
      createdAt: supplier.createdAt,
      user: supplier.user,
    };
  }
}
