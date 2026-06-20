import { Module } from "@nestjs/common";
import { TrackingGateway } from "./tracking.gateway";
import { TrackingController } from "./tracking.controller";
import { TrackingService } from "./tracking.service";
import { LocationService } from "./location.service";
import { GeofenceService } from "./geofence.service";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [NotificationsModule],
  controllers: [TrackingController],
  providers: [TrackingGateway, TrackingService, LocationService, GeofenceService],
  exports: [TrackingGateway, TrackingService, LocationService, GeofenceService],
})
export class TrackingModule {}
