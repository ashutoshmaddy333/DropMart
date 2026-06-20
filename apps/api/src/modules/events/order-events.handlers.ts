import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { PrismaService } from "../../prisma/prisma.module";
import { NotificationsService } from "../notifications/notifications.service";
import { orderConfirmedEmail, newOrderAdminEmail } from "../notifications/email-templates";
import type { OrderEventPayload } from "./order-events.types";

@Injectable()
export class OrderEventsHandlers {
  private readonly logger = new Logger(OrderEventsHandlers.name);

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  @OnEvent("order.payment_confirmed")
  async onPaymentConfirmed(payload: OrderEventPayload) {
    this.logger.log(`Order confirmed: ${payload.orderNumber}`);

    const email = orderConfirmedEmail({
      customerName: payload.customerName,
      orderNumber: payload.orderNumber,
      total: payload.total,
      trackUrl: `${process.env.ADMIN_APP_URL ?? "http://localhost:3000"}/account/orders/${payload.orderId}`,
    });

    await this.notifications.notifyUser({
      userId: payload.customerId,
      email: payload.customerEmail,
      type: "order_confirmed",
      title: "Order Confirmed",
      message: `Your order ${payload.orderNumber} is confirmed. We're preparing it now.`,
      link: `/account/orders/${payload.orderId}`,
      metadata: { orderId: payload.orderId, orderNumber: payload.orderNumber },
      emailSubject: email.subject,
      emailHtml: email.html,
      emailText: email.text,
    });

    const adminEmail = newOrderAdminEmail({
      orderNumber: payload.orderNumber,
      customerName: payload.customerName,
      total: payload.total,
      paymentMethod: payload.paymentMethod,
      adminUrl: `${process.env.ADMIN_APP_URL ?? "http://localhost:3000"}/admin/orders`,
    });

    await this.notifications.notifyAdmins({
      type: "order_placed",
      title: "New Order",
      message: `Order ${payload.orderNumber} from ${payload.customerName} — ₹${payload.total}`,
      link: "/admin/orders",
      metadata: { orderId: payload.orderId, orderNumber: payload.orderNumber },
      emailSubject: adminEmail.subject,
      emailHtml: adminEmail.html,
      emailText: adminEmail.text,
    });

    await this.runWarehousePipeline(payload);
    await this.runCourierPipeline(payload);
  }

  @OnEvent("order.payment_failed")
  async onPaymentFailed(payload: OrderEventPayload) {
    this.logger.warn(`Payment failed: ${payload.orderNumber}`);
    await this.notifications.notifyUser({
      userId: payload.customerId,
      email: payload.customerEmail,
      type: "payment_failed",
      title: "Payment Failed",
      message: `Payment for order ${payload.orderNumber} failed. Please retry checkout.`,
      link: "/checkout",
      metadata: { orderId: payload.orderId },
      emailSubject: `Payment failed — ${payload.orderNumber}`,
      emailHtml: `<p>Hi ${payload.customerName}, payment for order <strong>${payload.orderNumber}</strong> failed. Please try again.</p>`,
      emailText: `Payment failed for order ${payload.orderNumber}. Please retry checkout.`,
    });
  }

  private async runWarehousePipeline(payload: OrderEventPayload) {
    const processing = await this.prisma.masterOrderStatus.findUnique({ where: { code: "processing" } });
    if (!processing) return;

    await this.prisma.order.update({
      where: { id: payload.orderId },
      data: { statusId: processing.id },
    });

    await this.prisma.orderStatusHistory.create({
      data: {
        orderId: payload.orderId,
        fromStatus: "payment_confirmed",
        toStatus: "processing",
        source: "warehouse_pipeline",
      },
    });

    const supplier = await this.prisma.supplier.findUnique({
      where: { id: payload.supplierId },
      include: { user: { select: { id: true, email: true } } },
    });

    if (supplier?.user) {
      await this.notifications.notifyUser({
        userId: supplier.user.id,
        email: supplier.user.email,
        type: "order_update",
        title: "New Order to Pack",
        message: `Order ${payload.orderNumber} needs packing from your warehouse.`,
        link: "/supplier/orders",
        metadata: { orderId: payload.orderId },
        emailSubject: `New order to pack: ${payload.orderNumber}`,
        emailHtml: `<p>New order <strong>${payload.orderNumber}</strong> is ready for packing.</p>`,
        emailText: `New order ${payload.orderNumber} ready for packing.`,
      });
    }

    this.logger.log(`Warehouse notified for ${payload.orderNumber}`);
  }

  private async runCourierPipeline(payload: OrderEventPayload) {
    const awb = `SR${Date.now().toString().slice(-8)}`;
    await this.prisma.order.update({
      where: { id: payload.orderId },
      data: { trackingId: awb },
    });
    this.logger.log(`Courier AWB generated for ${payload.orderNumber}: ${awb}`);
  }
}
