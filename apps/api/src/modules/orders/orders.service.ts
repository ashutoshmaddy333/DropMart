import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.module";
import { CreateOrderDto } from "./dto/orders.dto";
import { RequestUser } from "../../common/decorators/auth.decorators";
import { buildOrderTrackingMeta } from "./order-tracking.util";
import { TrackingGateway } from "../tracking/tracking.gateway";
import { NotificationsService } from "../notifications/notifications.service";

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private trackingGateway: TrackingGateway,
    private notifications: NotificationsService,
  ) {}

  async create(dto: CreateOrderDto, customerId: string) {
    const paymentMethod = await this.prisma.masterPaymentMethod.findUnique({
      where: { code: dto.paymentMethodCode },
    });
    const pendingStatus = await this.prisma.masterOrderStatus.findUnique({ where: { code: "pending" } });
    const paymentStatus = await this.prisma.masterPaymentStatus.findUnique({
      where: { code: dto.paymentMethodCode === "cod" ? "pending" : "paid" },
    });
    if (!paymentMethod || !pendingStatus || !paymentStatus) {
      throw new BadRequestException("Invalid order configuration");
    }

    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, status: { code: "approved" } },
      include: { supplier: true },
    });
    if (products.length !== productIds.length) throw new BadRequestException("Invalid products");

    const supplierId = products[0].supplierId;
    const subtotal = dto.items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId)!;
      return sum + Number(product.price) * item.quantity;
    }, 0);

    const settings = await this.prisma.platformSetting.findMany();
    const threshold = Number(settings.find((s) => s.key === "free_shipping_threshold")?.value ?? 999);
    const defaultShipping = Number(settings.find((s) => s.key === "default_shipping_fee")?.value ?? 49);
    const shipping = subtotal >= threshold ? 0 : defaultShipping;

    const orderNumber = `DM-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;

    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        customerId,
        supplierId,
        statusId: pendingStatus.id,
        paymentMethodId: paymentMethod.id,
        paymentStatusId: paymentStatus.id,
        subtotal,
        shipping,
        total: subtotal + shipping,
        warehouseCity: products[0].warehouseCity,
        items: {
          create: dto.items.map((item) => {
            const product = products.find((p) => p.id === item.productId)!;
            return {
              productId: product.id,
              name: product.name,
              quantity: item.quantity,
              price: product.price,
              image: product.images[0],
              variant: item.variant,
            };
          }),
        },
        address: { create: dto.address },
      },
      include: this.orderIncludes(),
    });

    return this.formatOrder(order);
  }

  async getMyOrders(user: RequestUser) {
    const orders = await this.prisma.order.findMany({
      where: { customerId: user.id },
      include: this.orderIncludes(),
      orderBy: { createdAt: "desc" },
    });
    return orders.map((o) => this.formatOrder(o));
  }

  async getSupplierOrders(userId: string) {
    const supplier = await this.prisma.supplier.findUnique({ where: { userId } });
    if (!supplier) throw new NotFoundException("Supplier not found");

    const orders = await this.prisma.order.findMany({
      where: { supplierId: supplier.id },
      include: this.orderIncludes(),
      orderBy: { createdAt: "desc" },
    });
    return orders.map((o) => this.formatOrder(o));
  }

  async listAll() {
    const orders = await this.prisma.order.findMany({
      include: this.orderIncludes(),
      orderBy: { createdAt: "desc" },
    });
    return orders.map((o) => this.formatOrder(o));
  }

  async getById(id: string, user: RequestUser) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: this.orderIncludes(),
    });
    if (!order) throw new NotFoundException("Order not found");

    const canReadAll = user.permissions.includes("order:read");
    const isOwner = order.customerId === user.id;
    const supplier = await this.prisma.supplier.findUnique({ where: { userId: user.id } });
    const isSupplier = supplier && order.supplierId === supplier.id;

    if (!canReadAll && !isOwner && !isSupplier) {
      throw new ForbiddenException("Access denied");
    }

    return this.formatOrder(order);
  }

  async markPacked(orderId: string, userId: string) {
    const supplier = await this.prisma.supplier.findUnique({ where: { userId } });
    if (!supplier) throw new ForbiddenException("Supplier only");

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { status: true, customer: { select: { id: true, email: true, name: true } } },
    });
    if (!order || order.supplierId !== supplier.id) throw new NotFoundException("Order not found");
    if (order.status.code !== "processing") {
      throw new BadRequestException("Order must be in processing state to mark packed");
    }

    const packed = await this.prisma.masterOrderStatus.findUnique({ where: { code: "packed" } });
    if (!packed) throw new BadRequestException("Packed status not configured");

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { statusId: packed.id },
      include: this.orderIncludes(),
    });

    await this.recordHistory(orderId, "processing", "packed", "supplier_pack");

    await this.notifications.notifyUser({
      userId: order.customerId,
      email: order.customer.email,
      type: "order_update",
      title: "Order Packed",
      message: `Your order ${order.orderNumber} is packed and will be dispatched soon.`,
      link: `/account/orders/${orderId}`,
      metadata: { orderId },
      emailSubject: `Order packed — ${order.orderNumber}`,
      emailHtml: `<p>Hi ${order.customer.name}, your order <strong>${order.orderNumber}</strong> is packed and will be dispatched soon.</p>`,
      emailText: `Your order ${order.orderNumber} is packed.`,
    });

    await this.notifications.notifyAdmins({
      type: "order_placed",
      title: "Order Packed — Assign Rider",
      message: `Order ${order.orderNumber} is packed. Assign a delivery partner.`,
      link: "/admin/delivery",
      metadata: { orderId },
      emailSubject: `Assign rider — ${order.orderNumber}`,
      emailHtml: `<p>Order <strong>${order.orderNumber}</strong> is packed. Assign a delivery partner in the admin panel.</p>`,
      emailText: `Order ${order.orderNumber} packed — assign rider.`,
    });

    const formatted = this.formatOrder(updated);
    this.trackingGateway.broadcastOrderStatus(orderId, formatted);
    return formatted;
  }

  async updateStatus(orderId: string, statusCode: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { status: true },
    });
    if (!order) throw new NotFoundException("Order not found");

    const status = await this.prisma.masterOrderStatus.findUnique({ where: { code: statusCode } });
    if (!status) throw new BadRequestException("Invalid status");

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { statusId: status.id },
      include: this.orderIncludes(),
    });

    await this.recordHistory(orderId, order.status.code, statusCode, "admin");

    const formatted = this.formatOrder(updated);
    this.trackingGateway.broadcastOrderStatus(orderId, formatted);
    return formatted;
  }

  async recordHistory(orderId: string, fromStatus: string, toStatus: string, source: string, note?: string) {
    await this.prisma.orderStatusHistory.create({
      data: { orderId, fromStatus, toStatus, source, note },
    });
  }

  private orderIncludes() {
    return {
      status: true,
      paymentMethod: true,
      paymentStatus: true,
      items: true,
      address: true,
      customer: { select: { name: true, email: true } },
      supplier: { select: { businessName: true } },
      delivery: { include: { status: true, deliveryBoy: { include: { user: { select: { name: true, phone: true } } } } } },
      statusHistory: { orderBy: { createdAt: "asc" as const } },
    };
  }

  private formatOrder(order: Record<string, unknown>) {
    const o = order as {
      id: string; orderNumber: string; subtotal: unknown; shipping: unknown;
      discount: unknown; total: unknown; trackingId: string | null;
      warehouseCity: string; notes: string | null; createdAt: Date; updatedAt: Date;
      status: { code: string; label: string; color: string | null };
      paymentMethod: { code: string; label: string };
      paymentStatus: { code: string; label: string; color: string | null };
      items: { productId: string; name: string; quantity: number; price: unknown; image: string | null }[];
      address?: { name: string; phone: string; line1: string; city: string; state: string; pincode: string; lat: number | null; lng: number | null };
      customer?: { name: string; email: string };
      supplier?: { businessName: string };
      delivery?: {
        id: string;
        currentLat: number | null;
        currentLng: number | null;
        estimatedMins: number | null;
        status: { code: string; label: string };
        deliveryBoy?: { user: { name: string; phone: string | null } };
      };
      statusHistory?: { toStatus: string; createdAt: Date }[];
    };

    const delivery = o.delivery
      ? {
          id: o.delivery.id,
          lat: o.delivery.currentLat,
          lng: o.delivery.currentLng,
          estimatedMins: o.delivery.estimatedMins,
          status: o.delivery.status.code,
          statusLabel: o.delivery.status.label,
          deliveryBoyName: o.delivery.deliveryBoy?.user.name,
          deliveryBoyPhone: o.delivery.deliveryBoy?.user.phone,
        }
      : null;

    const tracking = buildOrderTrackingMeta({
      status: o.status.code,
      hasDelivery: !!o.delivery,
      deliveryStatus: o.delivery?.status.code,
      statusHistory: o.statusHistory,
    });

    return {
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customer?.name,
      customerEmail: o.customer?.email,
      supplierName: o.supplier?.businessName,
      status: o.status.code,
      statusLabel: o.status.label,
      statusColor: o.status.color,
      paymentMethod: o.paymentMethod.code,
      paymentMethodLabel: o.paymentMethod.label,
      paymentStatus: o.paymentStatus.code,
      paymentStatusLabel: o.paymentStatus.label,
      subtotal: Number(o.subtotal),
      shipping: Number(o.shipping),
      discount: Number(o.discount),
      total: Number(o.total),
      trackingId: o.trackingId,
      warehouseCity: o.warehouseCity,
      notes: o.notes,
      items: o.items.map((i) => ({ ...i, price: Number(i.price) })),
      address: o.address,
      delivery,
      timeline: tracking.timeline,
      waitingFor: tracking.waitingFor,
      waitingLabel: tracking.waitingLabel,
      canTrackLive: tracking.canTrackLive,
      statusHistory: (o.statusHistory ?? []).map((h) => ({
        toStatus: h.toStatus,
        at: h.createdAt.toISOString(),
      })),
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    };
  }
}
