import { forwardRef, Inject, Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.module";
import { RedisService } from "../../redis/redis.service";
import { NotificationsService } from "../notifications/notifications.service";
import { TrackingGateway } from "./tracking.gateway";
import { buildOrderTrackingMeta } from "../orders/order-tracking.util";
import { liveTrackingEmail } from "../notifications/email-templates";
import { GEOFENCE, estimateEtaMinutes, haversineMeters } from "./geofence.util";

type GeofenceEvent = "in_transit" | "nearby" | "arrived";

@Injectable()
export class GeofenceService {
  private readonly logger = new Logger(GeofenceService.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private notifications: NotificationsService,
    @Inject(forwardRef(() => TrackingGateway))
    private trackingGateway: TrackingGateway,
  ) {}

  async processLocationUpdate(input: {
    assignmentId: string;
    orderId: string;
    lat: number;
    lng: number;
    speed?: number;
    currentStatus: string;
    dropLat: number | null;
    dropLng: number | null;
    pickupLat: number | null;
    pickupLng: number | null;
  }): Promise<{ statusChanged: boolean; newStatus?: string; newStatusLabel?: string }> {
    const { assignmentId, orderId, lat, lng, speed, currentStatus, dropLat, dropLng } = input;
    if (!dropLat || !dropLng) return { statusChanged: false };

    const distToDropM = haversineMeters(lat, lng, dropLat, dropLng);
    const distToDropKm = distToDropM / 1000;

    let targetStatus: string | null = null;

    if (
      distToDropM <= GEOFENCE.arrivedRadiusM &&
      (speed == null || speed < GEOFENCE.stoppedSpeedMs) &&
      ["in_transit", "nearby", "picked_up"].includes(currentStatus)
    ) {
      targetStatus = "nearby";
    } else if (
      distToDropM <= GEOFENCE.nearbyRadiusM &&
      ["in_transit", "picked_up"].includes(currentStatus)
    ) {
      targetStatus = "nearby";
    } else if (["assigned", "picked_up"].includes(currentStatus)) {
      const moved = await this.detectMovement(assignmentId, lat, lng, input.pickupLat, input.pickupLng);
      if (moved) {
        targetStatus = currentStatus === "assigned" ? "picked_up" : "in_transit";
        if (currentStatus === "assigned" && moved > GEOFENCE.movementStartM * 1.5) {
          targetStatus = "in_transit";
        }
      }
    }

    if (!targetStatus || targetStatus === currentStatus) {
      await this.updateDynamicEta(assignmentId, distToDropKm, speed);
      return { statusChanged: false };
    }

    const statusRow = await this.prisma.masterDeliveryStatus.findUnique({ where: { code: targetStatus } });
    if (!statusRow) return { statusChanged: false };

    const data: Record<string, unknown> = { statusId: statusRow.id };
    if (targetStatus === "picked_up") data.pickedUpAt = new Date();

    await this.prisma.deliveryAssignment.update({
      where: { id: assignmentId },
      data,
    });

    const eventKey: GeofenceEvent =
      targetStatus === "nearby" ? "nearby" : targetStatus === "in_transit" ? "in_transit" : "in_transit";

    await this.notifyGeofenceEvent(orderId, assignmentId, eventKey, distToDropKm, targetStatus);
    await this.broadcastOrderUpdate(orderId);
    await this.updateDynamicEta(assignmentId, distToDropKm, speed);

    this.logger.log(`Geofence: order ${orderId} → ${targetStatus} (${Math.round(distToDropM)}m to drop)`);

    return { statusChanged: true, newStatus: targetStatus, newStatusLabel: statusRow.label };
  }

  private async detectMovement(
    assignmentId: string,
    lat: number,
    lng: number,
    pickupLat: number | null,
    pickupLng: number | null,
  ): Promise<number> {
    const startKey = `geofence:start:${assignmentId}`;
    let startRaw = await this.redis.get(startKey);
    if (!startRaw && pickupLat != null && pickupLng != null) {
      startRaw = JSON.stringify({ lat: pickupLat, lng: pickupLng });
      await this.redis.set(startKey, startRaw, 86400);
    }
    if (!startRaw) {
      await this.redis.set(startKey, JSON.stringify({ lat, lng }), 86400);
      return 0;
    }
    try {
      const start = JSON.parse(startRaw) as { lat: number; lng: number };
      return haversineMeters(start.lat, start.lng, lat, lng);
    } catch {
      return 0;
    }
  }

  private async updateDynamicEta(assignmentId: string, distanceKm: number, speedMs?: number) {
    const mins = estimateEtaMinutes(distanceKm, speedMs);
    await this.prisma.deliveryAssignment.update({
      where: { id: assignmentId },
      data: { estimatedMins: mins },
    });
  }

  private async notifyGeofenceEvent(
    orderId: string,
    assignmentId: string,
    event: GeofenceEvent,
    distanceKm: number,
    statusCode: string,
  ) {
    const dedupeKey = `geofence:notify:${assignmentId}:${event}`;
    const seen = await this.redis.get(dedupeKey);
    if (seen) return;
    await this.redis.set(dedupeKey, "1", 300);

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        delivery: {
          include: {
            deliveryBoy: { include: { user: { select: { name: true } } } },
          },
        },
      },
    });
    if (!order?.customer) return;

    const appBase = process.env.CORS_ORIGIN ?? "http://localhost:3000";
    const trackUrl = `${appBase}/track/${orderId}`;
    const riderName = order.delivery?.deliveryBoy?.user.name ?? "Your delivery partner";

    const messages: Record<string, { title: string; message: string }> = {
      in_transit: {
        title: "Order on the way",
        message: `${riderName} is heading to you with order ${order.orderNumber}. Track live on the map.`,
      },
      nearby: {
        title: "Rider is nearby",
        message: `${riderName} is about ${Math.max(1, Math.round(distanceKm * 1000))}m away. Order ${order.orderNumber} will arrive soon.`,
      },
      arrived: {
        title: "Rider at your location",
        message: `${riderName} has reached your delivery address for order ${order.orderNumber}.`,
      },
    };

    const copy = messages[event] ?? messages.in_transit;
    const email = liveTrackingEmail({
      customerName: order.customer.name,
      orderNumber: order.orderNumber,
      riderName,
      statusLabel: statusCode.replace("_", " "),
      trackUrl,
      message: copy.message,
    });

    await this.notifications.notifyUser({
      userId: order.customer.id,
      email: order.customer.email,
      type: "order_update",
      title: copy.title,
      message: copy.message,
      link: `/account/orders/${orderId}`,
      emailSubject: email.subject,
      emailHtml: email.html,
      emailText: email.text,
    });

    await this.notifications.notifyAdmins({
      type: "order_placed",
      title: `Live tracking: ${order.orderNumber}`,
      message: `${riderName} — ${copy.message}`,
      link: `/admin/orders`,
      metadata: { orderId, assignmentId, event, statusCode },
      emailSubject: `[Fleet] ${copy.title} — ${order.orderNumber}`,
      emailHtml: email.html,
      emailText: email.text,
    });
  }

  async notifyRiderAssigned(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        delivery: {
          include: {
            deliveryBoy: { include: { user: { select: { name: true, phone: true } } } },
          },
        },
      },
    });
    if (!order?.customer || !order.delivery) return;

    const appBase = process.env.CORS_ORIGIN ?? "http://localhost:3000";
    const trackUrl = `${appBase}/track/${orderId}`;
    const riderName = order.delivery.deliveryBoy.user.name;

    const title = "Delivery partner assigned";
    const message = `${riderName} will deliver order ${order.orderNumber}. Live map tracking is now active.`;

    const email = liveTrackingEmail({
      customerName: order.customer.name,
      orderNumber: order.orderNumber,
      riderName,
      statusLabel: "Out for delivery",
      trackUrl,
      message,
    });

    await this.notifications.notifyUser({
      userId: order.customer.id,
      email: order.customer.email,
      type: "order_update",
      title,
      message,
      link: `/track/${orderId}`,
      emailSubject: email.subject,
      emailHtml: email.html,
      emailText: email.text,
    });

    await this.notifications.notifyAdmins({
      type: "order_placed",
      title: `Rider assigned: ${order.orderNumber}`,
      message: `${riderName} assigned — customer notified for live tracking.`,
      link: `/admin/delivery`,
      metadata: { orderId },
      emailSubject: `[Fleet] Rider assigned — ${order.orderNumber}`,
      emailHtml: email.html,
      emailText: email.text,
    });
  }

  private async broadcastOrderUpdate(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        status: true,
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
            deliveryBoyName: order.delivery.deliveryBoy.user.name,
          }
        : null,
      timeline: tracking.timeline,
      waitingFor: tracking.waitingFor,
      waitingLabel: tracking.waitingLabel,
      canTrackLive: tracking.canTrackLive,
    });
  }
}
