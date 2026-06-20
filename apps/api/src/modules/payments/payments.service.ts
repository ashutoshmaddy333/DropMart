import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.module";
import { RazorpayService } from "./razorpay.service";
import { OrderEventsService } from "../events/order-events.service";
import { CheckoutDto, VerifyPaymentDto } from "./dto/payments.dto";
import type { OrderEventPayload } from "../events/order-events.types";

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private razorpay: RazorpayService,
    private orderEvents: OrderEventsService,
  ) {}

  async checkout(dto: CheckoutDto, customerId: string) {
    const customer = await this.prisma.user.findUnique({ where: { id: customerId } });
    if (!customer) throw new NotFoundException("Customer not found");

    const orderData = await this.buildOrderData(dto, customerId);
    const pendingPayment = await this.prisma.masterOrderStatus.findUnique({ where: { code: "pending_payment" } });
    if (!pendingPayment) throw new BadRequestException("Order status not configured");

    const paymentMethodCode = dto.paymentMode === "cod" ? "cod" : "razorpay";
    const paymentMethod = await this.prisma.masterPaymentMethod.findUnique({ where: { code: paymentMethodCode } });
    const paymentStatusPending = await this.prisma.masterPaymentStatus.findUnique({ where: { code: "pending" } });
    if (!paymentMethod || !paymentStatusPending) throw new BadRequestException("Payment config missing");

    const orderNumber = `DM-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
    const amountPaise = Math.round(orderData.total * 100);

    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        customerId,
        supplierId: orderData.supplierId,
        statusId: pendingPayment.id,
        paymentMethodId: paymentMethod.id,
        paymentStatusId: paymentStatusPending.id,
        subtotal: orderData.subtotal,
        shipping: orderData.shipping,
        total: orderData.total,
        warehouseCity: orderData.warehouseCity,
        items: { create: orderData.items },
        address: { create: dto.address },
        statusHistory: {
          create: { toStatus: "pending_payment", source: "checkout" },
        },
      },
      include: {
        status: true,
        customer: { select: { name: true, email: true } },
        paymentMethod: true,
      },
    });

    if (dto.paymentMode === "cod") {
      const confirmed = await this.prisma.masterOrderStatus.findUnique({ where: { code: "confirmed" } });
      if (confirmed) {
        await this.prisma.order.update({
          where: { id: order.id },
          data: { statusId: confirmed.id },
        });
      }

      await this.prisma.paymentTransaction.create({
        data: {
          orderId: order.id,
          customerId,
          amountPaise,
          method: "cod",
          status: "pending",
        },
      });

      await this.emitConfirmed(order.id);
      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentMode: "cod",
        status: "confirmed",
        total: orderData.total,
      };
    }

    if (!this.razorpay.isConfigured()) {
      throw new BadRequestException("Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
    }

    const rzOrder = await this.razorpay.createOrder({
      amountPaise,
      receipt: order.orderNumber,
      notes: { order_id: order.id, customer_id: customerId },
    });

    let qrCodeImageUrl: string | undefined;
    let qrCodeId: string | undefined;

    if (dto.paymentMode === "razorpay_qr") {
      const qr = await this.razorpay.createQrCode({
        amountPaise,
        orderId: order.id,
        description: `DropMart ${order.orderNumber}`,
      });
      qrCodeId = qr.id;
      qrCodeImageUrl = qr.image_url;
    }

    await this.prisma.paymentTransaction.create({
      data: {
        orderId: order.id,
        customerId,
        razorpayOrderId: rzOrder.id,
        amountPaise,
        method: dto.paymentMode,
        status: "created",
        qrCodeId,
        qrCodeImageUrl,
      },
    });

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentMode: dto.paymentMode,
      razorpayKeyId: this.razorpay.getKeyId(),
      razorpayOrderId: rzOrder.id,
      amountPaise,
      currency: "INR",
      qrCodeImageUrl,
      customer: { name: customer.name, email: customer.email, phone: customer.phone },
    };
  }

  async verifyClientPayment(dto: VerifyPaymentDto, customerId: string) {
    const payment = await this.prisma.paymentTransaction.findUnique({
      where: { orderId: dto.orderId },
      include: { order: { include: { customer: true, status: true, paymentMethod: true } } },
    });
    if (!payment || payment.customerId !== customerId) {
      throw new NotFoundException("Payment not found");
    }
    if (payment.razorpayOrderId !== dto.razorpayOrderId) {
      throw new BadRequestException("Order ID mismatch");
    }
    if (payment.status === "captured") {
      return { alreadyProcessed: true, orderId: dto.orderId };
    }

    const valid = this.razorpay.verifyPaymentSignature(
      dto.razorpayOrderId,
      dto.razorpayPaymentId,
      dto.razorpaySignature,
    );
    if (!valid) throw new UnauthorizedException("Invalid payment signature");

    await this.capturePayment({
      orderId: dto.orderId,
      razorpayPaymentId: dto.razorpayPaymentId,
      razorpaySignature: dto.razorpaySignature,
      source: "client_verify",
    });

    return { success: true, orderId: dto.orderId };
  }

  async handleWebhook(rawBody: Buffer, signature: string | undefined, eventId: string | undefined) {
    if (!signature || !this.razorpay.verifyWebhookSignature(rawBody, signature)) {
      throw new UnauthorizedException("Invalid webhook signature");
    }

    const payload = JSON.parse(rawBody.toString()) as {
      event: string;
      payload: {
        payment?: {
          entity: {
            id: string;
            order_id?: string | null;
            amount: number;
            status: string;
            error_description?: string;
            qr_code?: string;
          };
        };
        qr_code?: { entity: { id: string; payment_amount: number } };
      };
    };

    const event = payload.event;
    this.logger.log(`Razorpay webhook: ${event}`);

    if (event === "qr_code.credited") {
      const qrEntity = payload.payload.qr_code?.entity;
      const payEntity = payload.payload.payment?.entity;
      if (!qrEntity || !payEntity) return { received: true };

      const payment = await this.prisma.paymentTransaction.findFirst({
        where: { qrCodeId: qrEntity.id },
      });
      if (!payment) {
        this.logger.warn(`No payment record for QR ${qrEntity.id}`);
        return { received: true };
      }
      if (payment.webhookEventId === eventId) return { received: true, duplicate: true };
      if (payEntity.amount !== payment.amountPaise) {
        throw new BadRequestException("QR payment amount mismatch");
      }

      await this.capturePayment({
        orderId: payment.orderId,
        razorpayPaymentId: payEntity.id,
        webhookEventId: eventId,
        source: "qr_webhook",
      });
      return { received: true };
    }

    if (event === "payment.captured") {
      const entity = payload.payload.payment?.entity;
      if (!entity) return { received: true };

      let payment = entity.order_id
        ? await this.prisma.paymentTransaction.findUnique({ where: { razorpayOrderId: entity.order_id } })
        : null;

      if (!payment && entity.qr_code) {
        payment = await this.prisma.paymentTransaction.findFirst({ where: { qrCodeId: entity.qr_code } });
      }

      if (!payment) {
        this.logger.warn(`No payment record for captured payment ${entity.id}`);
        return { received: true };
      }

      if (payment.webhookEventId === eventId) return { received: true, duplicate: true };
      if (entity.amount !== payment.amountPaise) {
        throw new BadRequestException("Payment amount mismatch");
      }

      await this.capturePayment({
        orderId: payment.orderId,
        razorpayPaymentId: entity.id,
        webhookEventId: eventId,
        source: "webhook",
      });
    }

    if (event === "payment.failed") {
      const entity = payload.payload.payment?.entity;
      if (!entity) return { received: true };

      let payment = entity.order_id
        ? await this.prisma.paymentTransaction.findUnique({
            where: { razorpayOrderId: entity.order_id },
            include: { order: { include: { customer: true, status: true, paymentMethod: true } } },
          })
        : null;

      if (!payment && entity.qr_code) {
        payment = await this.prisma.paymentTransaction.findFirst({
          where: { qrCodeId: entity.qr_code },
          include: { order: { include: { customer: true, status: true, paymentMethod: true } } },
        });
      }

      if (!payment || payment.status === "captured") return { received: true };

      await this.prisma.paymentTransaction.update({
        where: { id: payment.id },
        data: {
          status: "failed",
          failureReason: entity.error_description,
          webhookEventId: eventId,
        },
      });

      await this.orderEvents.emit(this.toEventPayload(payment.order, "order.payment_failed"));
    }

    return { received: true };
  }

  private async capturePayment(input: {
    orderId: string;
    razorpayPaymentId: string;
    razorpaySignature?: string;
    webhookEventId?: string;
    source: string;
  }) {
    const payment = await this.prisma.paymentTransaction.findUnique({
      where: { orderId: input.orderId },
      include: { order: { include: { customer: true, status: true, paymentMethod: true, supplier: true } } },
    });
    if (!payment) throw new NotFoundException("Payment not found");
    if (payment.status === "captured") return;

    const paidStatus = await this.prisma.masterPaymentStatus.findUnique({ where: { code: "paid" } });
    const confirmedStatus = await this.prisma.masterOrderStatus.findUnique({ where: { code: "payment_confirmed" } });
    if (!paidStatus || !confirmedStatus) throw new BadRequestException("Status config missing");

    await this.prisma.$transaction([
      this.prisma.paymentTransaction.update({
        where: { id: payment.id },
        data: {
          status: "captured",
          razorpayPaymentId: input.razorpayPaymentId,
          razorpaySignature: input.razorpaySignature,
          webhookEventId: input.webhookEventId,
        },
      }),
      this.prisma.order.update({
        where: { id: input.orderId },
        data: {
          statusId: confirmedStatus.id,
          paymentStatusId: paidStatus.id,
        },
      }),
      this.prisma.orderStatusHistory.create({
        data: {
          orderId: input.orderId,
          fromStatus: payment.order.status.code,
          toStatus: "payment_confirmed",
          source: input.source,
          metadata: { razorpayPaymentId: input.razorpayPaymentId },
        },
      }),
    ]);

    const updated = await this.prisma.order.findUnique({
      where: { id: input.orderId },
      include: { customer: true, status: true, paymentMethod: true, supplier: true },
    });
    if (updated) {
      await this.orderEvents.emit(this.toEventPayload(updated, "order.payment_confirmed"));
    }
  }

  private async emitConfirmed(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true, status: true, paymentMethod: true, supplier: true },
    });
    if (order) {
      await this.orderEvents.emit(this.toEventPayload(order, "order.payment_confirmed"));
    }
  }

  private toEventPayload(
    order: {
      id: string;
      orderNumber: string;
      customerId: string;
      supplierId: string;
      total: unknown;
      status: { code: string };
      paymentMethod: { code: string };
      customer: { name: string; email: string };
    },
    type: OrderEventPayload["type"],
  ): OrderEventPayload {
    return {
      type,
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      customerEmail: order.customer.email,
      customerName: order.customer.name,
      supplierId: order.supplierId,
      total: Number(order.total),
      status: order.status.code,
      paymentMethod: order.paymentMethod.code,
      timestamp: new Date().toISOString(),
    };
  }

  private async buildOrderData(dto: CheckoutDto, _customerId: string) {
    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, status: { code: "approved" } },
      include: { supplier: true },
    });
    if (products.length !== productIds.length) throw new BadRequestException("Invalid or unavailable products");

    const subtotal = dto.items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId)!;
      return sum + Number(product.price) * item.quantity;
    }, 0);

    const settings = await this.prisma.platformSetting.findMany();
    const threshold = Number(settings.find((s) => s.key === "free_shipping_threshold")?.value ?? 999);
    const defaultShipping = Number(settings.find((s) => s.key === "default_shipping_fee")?.value ?? 49);
    const shipping = subtotal >= threshold ? 0 : defaultShipping;

    return {
      supplierId: products[0].supplierId,
      warehouseCity: products[0].warehouseCity,
      subtotal,
      shipping,
      total: subtotal + shipping,
      items: dto.items.map((item) => {
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
    };
  }
}
