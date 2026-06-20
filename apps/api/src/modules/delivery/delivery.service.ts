import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.module";
import { AssignDeliveryDto } from "./dto/delivery.dto";
import { TrackingGateway } from "../tracking/tracking.gateway";
import { GeofenceService } from "../tracking/geofence.service";
import { buildOrderTrackingMeta } from "../orders/order-tracking.util";

@Injectable()
export class DeliveryService {
  constructor(
    private prisma: PrismaService,
    private trackingGateway: TrackingGateway,
    private geofence: GeofenceService,
  ) {}

  async listDeliveryBoys() {
    const boys = await this.prisma.deliveryBoy.findMany({
      include: { user: { select: { id: true, name: true, email: true, phone: true } } },
      orderBy: { createdAt: "desc" },
    });
    return boys.map((b) => ({
      id: b.id,
      userId: b.userId,
      name: b.user.name,
      email: b.user.email,
      phone: b.user.phone,
      vehicleNo: b.vehicleNo,
      isOnline: b.isOnline,
      currentLat: b.currentLat,
      currentLng: b.currentLng,
    }));
  }

  async assign(dto: AssignDeliveryDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { address: true, delivery: true, status: true },
    });
    if (!order) throw new NotFoundException("Order not found");
    if (order.delivery) throw new BadRequestException("Order already has a delivery assignment");
    if (!["packed", "processing"].includes(order.status.code)) {
      throw new BadRequestException("Order must be packed before assigning delivery (or in processing for admin override)");
    }

    const boy = await this.prisma.deliveryBoy.findUnique({ where: { id: dto.deliveryBoyId } });
    if (!boy) throw new NotFoundException("Delivery partner not found");

    const assignedStatus = await this.prisma.masterDeliveryStatus.findUnique({ where: { code: "assigned" } });
    if (!assignedStatus) throw new BadRequestException("Delivery status not configured");

    const outForDelivery = await this.prisma.masterOrderStatus.findUnique({ where: { code: "out_for_delivery" } });

    const assignment = await this.prisma.deliveryAssignment.create({
      data: {
        orderId: dto.orderId,
        deliveryBoyId: dto.deliveryBoyId,
        statusId: assignedStatus.id,
        pickupLat: dto.pickupLat ?? boy.currentLat ?? 19.076,
        pickupLng: dto.pickupLng ?? boy.currentLng ?? 72.8777,
        dropLat: dto.dropLat ?? order.address?.lat,
        dropLng: dto.dropLng ?? order.address?.lng,
        currentLat: boy.currentLat,
        currentLng: boy.currentLng,
        estimatedMins: dto.estimatedMins ?? 30,
      },
      include: { status: true, deliveryBoy: { include: { user: true } }, order: { include: { address: true } } },
    });

    if (outForDelivery) {
      await this.prisma.order.update({
        where: { id: dto.orderId },
        data: { statusId: outForDelivery.id },
      });
      await this.prisma.orderStatusHistory.create({
        data: {
          orderId: dto.orderId,
          fromStatus: order.status.code,
          toStatus: "out_for_delivery",
          source: "delivery_assign",
        },
      });
      await this.broadcastOrderUpdate(dto.orderId);
      await this.geofence.notifyRiderAssigned(dto.orderId);
    }

    return this.formatAssignment(assignment);
  }

  async getMyAssignments(userId: string) {
    const boy = await this.prisma.deliveryBoy.findUnique({ where: { userId } });
    if (!boy) throw new NotFoundException("Delivery profile not found");

    const assignments = await this.prisma.deliveryAssignment.findMany({
      where: {
        deliveryBoyId: boy.id,
        status: { code: { not: "delivered" } },
      },
      include: {
        status: true,
        order: { include: { address: true, customer: { select: { name: true, phone: true } } } },
      },
      orderBy: { assignedAt: "desc" },
    });

    return assignments.map((a) => this.formatAssignment(a));
  }

  async updateStatus(assignmentId: string, userId: string, statusCode: string) {
    const boy = await this.prisma.deliveryBoy.findUnique({ where: { userId } });
    if (!boy) throw new NotFoundException("Delivery profile not found");

    const assignment = await this.prisma.deliveryAssignment.findUnique({
      where: { id: assignmentId },
      include: { status: true, order: { include: { status: true } } },
    });
    if (!assignment || assignment.deliveryBoyId !== boy.id) {
      throw new NotFoundException("Assignment not found");
    }

    const status = await this.prisma.masterDeliveryStatus.findUnique({ where: { code: statusCode } });
    if (!status) throw new BadRequestException("Invalid delivery status");

    const data: Record<string, unknown> = { statusId: status.id };
    if (statusCode === "picked_up") data.pickedUpAt = new Date();
    if (statusCode === "delivered") {
      data.deliveredAt = new Date();
      const deliveredOrderStatus = await this.prisma.masterOrderStatus.findUnique({ where: { code: "delivered" } });
      if (deliveredOrderStatus) {
        await this.prisma.order.update({
          where: { id: assignment.orderId },
          data: { statusId: deliveredOrderStatus.id },
        });
        await this.prisma.orderStatusHistory.create({
          data: {
            orderId: assignment.orderId,
            fromStatus: assignment.order.status.code,
            toStatus: "delivered",
            source: "delivery_partner",
          },
        });
        await this.broadcastOrderUpdate(assignment.orderId);
      }
    }

    const updated = await this.prisma.deliveryAssignment.update({
      where: { id: assignmentId },
      data,
      include: {
        status: true,
        order: { include: { address: true, customer: { select: { name: true, phone: true } } } },
        deliveryBoy: { include: { user: true } },
      },
    });

    if (statusCode !== "delivered") {
      await this.broadcastOrderUpdate(assignment.orderId);
    }

    return this.formatAssignment(updated);
  }

  private async broadcastOrderUpdate(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        status: true,
        paymentMethod: true,
        paymentStatus: true,
        items: true,
        address: true,
        customer: { select: { name: true, email: true } },
        supplier: { select: { businessName: true } },
        delivery: { include: { status: true, deliveryBoy: { include: { user: { select: { name: true, phone: true } } } } } },
        statusHistory: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!order) return;

    const tracking = buildOrderTrackingMeta({
      status: order.status.code,
      hasDelivery: !!order.delivery,
      deliveryStatus: order.delivery?.status.code,
      statusHistory: order.statusHistory,
    });

    this.trackingGateway.broadcastOrderStatus(orderId, {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status.code,
      statusLabel: order.status.label,
      delivery: order.delivery
        ? {
            id: order.delivery.id,
            lat: order.delivery.currentLat,
            lng: order.delivery.currentLng,
            estimatedMins: order.delivery.estimatedMins,
            status: order.delivery.status.code,
            statusLabel: order.delivery.status.label,
          }
        : null,
      timeline: tracking.timeline,
      waitingFor: tracking.waitingFor,
      waitingLabel: tracking.waitingLabel,
      canTrackLive: tracking.canTrackLive,
    });
  }

  private formatAssignment(assignment: {
    id: string;
    orderId: string;
    currentLat: number | null;
    currentLng: number | null;
    pickupLat: number | null;
    pickupLng: number | null;
    dropLat: number | null;
    dropLng: number | null;
    estimatedMins: number | null;
    assignedAt: Date;
    pickedUpAt: Date | null;
    deliveredAt: Date | null;
    status: { code: string; label: string; color: string | null };
    order: {
      orderNumber: string;
      address?: { name: string; phone: string; line1: string; city: string; lat: number | null; lng: number | null } | null;
      customer?: { name: string; phone: string | null };
    };
    deliveryBoy?: { user: { name: string } };
  }) {
    return {
      id: assignment.id,
      orderId: assignment.orderId,
      orderNumber: assignment.order.orderNumber,
      status: assignment.status.code,
      statusLabel: assignment.status.label,
      statusColor: assignment.status.color,
      lat: assignment.currentLat,
      lng: assignment.currentLng,
      pickupLat: assignment.pickupLat,
      pickupLng: assignment.pickupLng,
      dropLat: assignment.dropLat ?? assignment.order.address?.lat,
      dropLng: assignment.dropLng ?? assignment.order.address?.lng,
      estimatedMins: assignment.estimatedMins,
      customerName: assignment.order.customer?.name ?? assignment.order.address?.name,
      customerPhone: assignment.order.customer?.phone ?? assignment.order.address?.phone,
      address: assignment.order.address,
      deliveryBoyName: assignment.deliveryBoy?.user.name,
      assignedAt: assignment.assignedAt.toISOString(),
      pickedUpAt: assignment.pickedUpAt?.toISOString() ?? null,
      deliveredAt: assignment.deliveredAt?.toISOString() ?? null,
    };
  }
}
