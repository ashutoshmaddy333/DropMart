import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { TrackingGateway } from "./tracking.gateway";
import { TrackingService } from "./tracking.service";
import { LocationService } from "./location.service";
import { Public, RequirePermissions } from "../../common/decorators/auth.decorators";
import { AuthGuard } from "../../common/guards/auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { RequestUser } from "../../common/decorators/auth.decorators";
import { UpdateLocationDto } from "./dto/tracking.dto";

@Controller("tracking")
export class TrackingController {
  constructor(
    private trackingGateway: TrackingGateway,
    private trackingService: TrackingService,
    private locationService: LocationService,
  ) {}

  @Get("fleet")
  @UseGuards(AuthGuard)
  @RequirePermissions("order:process")
  getFleet() {
    return this.trackingService.getFleetOverview();
  }

  @Public()
  @Get(":orderId")
  getTracking(@Param("orderId") orderId: string) {
    return this.trackingService.getDeliveryData(orderId);
  }

  @Post("location")
  @UseGuards(AuthGuard)
  @RequirePermissions("delivery:update")
  async postLocation(@Body() dto: UpdateLocationDto, @CurrentUser() user: RequestUser) {
    const update = await this.locationService.ingestLocation(user.id, dto);
    this.trackingGateway.broadcastToOrder(update.orderId, {
      orderId: update.orderId,
      assignmentId: update.assignmentId,
      lat: update.lat,
      lng: update.lng,
      heading: update.heading,
      speed: update.speed,
      status: update.status,
      statusLabel: update.statusLabel,
      estimatedMins: update.estimatedMins,
      timestamp: update.timestamp,
    });
    return update;
  }
}
