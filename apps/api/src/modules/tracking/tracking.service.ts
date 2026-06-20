import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.module";
import { LocationService } from "./location.service";
import { haversineMeters } from "./geofence.util";

@Injectable()
export class TrackingService {
  constructor(
    private prisma: PrismaService,
    private location: LocationService,
  ) {}

  async getDeliveryData(orderId: string) {
    const assignment = await this.prisma.deliveryAssignment.findUnique({
      where: { orderId },
      include: {
        status: true,
        deliveryBoy: { include: { user: { select: { name: true, phone: true } } } },
        order: { include: { address: true } },
        locations: { orderBy: { recordedAt: "desc" }, take: 50 },
      },
    });
    if (!assignment) return null;

    const live = await this.location.getLiveLocation(assignment.id);
    const lat = live?.lat ?? assignment.currentLat;
    const lng = live?.lng ?? assignment.currentLng;

    const dropLat = assignment.dropLat ?? assignment.order.address?.lat;
    const dropLng = assignment.dropLng ?? assignment.order.address?.lng;
    let distanceKm: number | null = null;
    if (lat != null && lng != null && dropLat != null && dropLng != null) {
      distanceKm = haversineMeters(lat, lng, dropLat, dropLng) / 1000;
    }

    return {
      orderId: assignment.orderId,
      assignmentId: assignment.id,
      lat,
      lng,
      heading: live?.heading,
      speed: live?.speed,
      pickupLat: assignment.pickupLat,
      pickupLng: assignment.pickupLng,
      dropLat,
      dropLng,
      distanceKm,
      nearbyRadiusM: 0.5,
      status: live?.status ?? assignment.status.code,
      statusLabel: live?.statusLabel ?? assignment.status.label,
      estimatedMins: live?.estimatedMins ?? assignment.estimatedMins,
      deliveryBoy: {
        name: assignment.deliveryBoy.user.name,
        phone: assignment.deliveryBoy.user.phone,
        vehicleNo: assignment.deliveryBoy.vehicleNo,
      },
      route: assignment.locations
        .slice()
        .reverse()
        .map((l) => ({
          lat: l.lat,
          lng: l.lng,
          recordedAt: l.recordedAt.toISOString(),
        })),
      timestamp: live?.timestamp ?? new Date().toISOString(),
      redisLive: !!live,
    };
  }

  async getFleetOverview() {
    const assignments = await this.prisma.deliveryAssignment.findMany({
      where: { status: { code: { notIn: ["delivered"] } } },
      include: {
        status: true,
        order: { select: { orderNumber: true, id: true } },
        deliveryBoy: {
          include: { user: { select: { name: true, phone: true } } },
        },
      },
      orderBy: { assignedAt: "desc" },
    });

    const fleet = await Promise.all(
      assignments.map(async (a) => {
        const live = await this.location.getLiveLocation(a.id);
        const lat = live?.lat ?? a.currentLat;
        const lng = live?.lng ?? a.currentLng;
        const dropLat = a.dropLat;
        const dropLng = a.dropLng;
        let distanceKm: number | null = null;
        if (lat != null && lng != null && dropLat != null && dropLng != null) {
          distanceKm = haversineMeters(lat, lng, dropLat, dropLng) / 1000;
        }
        return {
          assignmentId: a.id,
          orderId: a.orderId,
          orderNumber: a.order.orderNumber,
          lat,
          lng,
          dropLat,
          dropLng,
          distanceKm,
          status: live?.status ?? a.status.code,
          statusLabel: live?.statusLabel ?? a.status.label,
          estimatedMins: live?.estimatedMins ?? a.estimatedMins,
          riderName: a.deliveryBoy.user.name,
          riderPhone: a.deliveryBoy.user.phone,
          vehicleNo: a.deliveryBoy.vehicleNo,
          redisLive: !!live,
        };
      }),
    );

    return fleet;
  }
}
