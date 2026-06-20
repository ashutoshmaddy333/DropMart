import { ForbiddenException, forwardRef, Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.module";
import { RedisService } from "../../redis/redis.service";
import { GeofenceService } from "./geofence.service";
import { estimateEtaMinutes, haversineMeters } from "./geofence.util";

export interface LiveLocation {
  assignmentId: string;
  orderId: string;
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
  status: string;
  statusLabel: string;
  estimatedMins?: number | null;
  timestamp: string;
}

const LIVE_KEY = (assignmentId: string) => `delivery:live:${assignmentId}`;
const BATCH_KEY = "delivery:location:batch";

@Injectable()
export class LocationService implements OnModuleInit {
  private readonly logger = new Logger(LocationService.name);
  private flushTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    @Inject(forwardRef(() => GeofenceService))
    private geofence: GeofenceService,
  ) {}

  onModuleInit() {
    this.flushTimer = setInterval(() => {
      this.flushBatchToDb().catch((err) => this.logger.error("Batch flush failed", err));
    }, 30_000);
  }

  async ingestLocation(
    userId: string,
    payload: { assignmentId: string; lat: number; lng: number; heading?: number; speed?: number },
  ): Promise<LiveLocation> {
    const assignment = await this.prisma.deliveryAssignment.findUnique({
      where: { id: payload.assignmentId },
      include: { status: true, deliveryBoy: true, order: { include: { address: true } } },
    });
    if (!assignment) throw new ForbiddenException("Assignment not found");
    if (assignment.deliveryBoy.userId !== userId) {
      throw new ForbiddenException("Not your delivery assignment");
    }

    const update: LiveLocation = {
      assignmentId: payload.assignmentId,
      orderId: assignment.orderId,
      lat: payload.lat,
      lng: payload.lng,
      heading: payload.heading,
      speed: payload.speed,
      status: assignment.status.code,
      statusLabel: assignment.status.label,
      estimatedMins: assignment.estimatedMins,
      timestamp: new Date().toISOString(),
    };

    await this.redis.lpush(
      BATCH_KEY,
      JSON.stringify({
        assignmentId: payload.assignmentId,
        lat: payload.lat,
        lng: payload.lng,
        heading: payload.heading,
        speed: payload.speed,
        recordedAt: update.timestamp,
      }),
    );

    await this.prisma.deliveryAssignment.update({
      where: { id: payload.assignmentId },
      data: { currentLat: payload.lat, currentLng: payload.lng },
    });

    await this.prisma.deliveryBoy.update({
      where: { id: assignment.deliveryBoyId },
      data: { currentLat: payload.lat, currentLng: payload.lng, isOnline: true },
    });

    const dropLat = assignment.dropLat ?? assignment.order.address?.lat ?? null;
    const dropLng = assignment.dropLng ?? assignment.order.address?.lng ?? null;
    let estimatedMins = assignment.estimatedMins;
    if (dropLat != null && dropLng != null) {
      const distKm = haversineMeters(payload.lat, payload.lng, dropLat, dropLng) / 1000;
      estimatedMins = estimateEtaMinutes(distKm, payload.speed);
      update.estimatedMins = estimatedMins;
    }

    const geo = await this.geofence.processLocationUpdate({
      assignmentId: payload.assignmentId,
      orderId: assignment.orderId,
      lat: payload.lat,
      lng: payload.lng,
      speed: payload.speed,
      currentStatus: assignment.status.code,
      dropLat,
      dropLng,
      pickupLat: assignment.pickupLat,
      pickupLng: assignment.pickupLng,
    });

    if (geo.statusChanged && geo.newStatus && geo.newStatusLabel) {
      update.status = geo.newStatus;
      update.statusLabel = geo.newStatusLabel;
    }

    await this.redis.set(LIVE_KEY(payload.assignmentId), JSON.stringify(update), 120);

    return update;
  }

  async getLiveLocation(assignmentId: string): Promise<LiveLocation | null> {
    const raw = await this.redis.get(LIVE_KEY(assignmentId));
    if (!raw) return null;
    try {
      return JSON.parse(raw) as LiveLocation;
    } catch {
      return null;
    }
  }

  private async flushBatchToDb() {
    const items = await this.redis.lrange(BATCH_KEY, 0, 499);
    if (!items.length) return;

    const records = items
      .map((item) => {
        try {
          return JSON.parse(item) as {
            assignmentId: string;
            lat: number;
            lng: number;
            heading?: number;
            speed?: number;
            recordedAt: string;
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean) as {
      assignmentId: string;
      lat: number;
      lng: number;
      heading?: number;
      speed?: number;
      recordedAt: string;
    }[];

    if (!records.length) return;

    await this.prisma.deliveryLocation.createMany({
      data: records.map((r) => ({
        assignmentId: r.assignmentId,
        lat: r.lat,
        lng: r.lng,
        heading: r.heading,
        speed: r.speed,
        recordedAt: new Date(r.recordedAt),
      })),
      skipDuplicates: true,
    });

    await this.redis.ltrim(BATCH_KEY, items.length, -1);
    this.logger.debug(`Flushed ${records.length} location points to database`);
  }
}
