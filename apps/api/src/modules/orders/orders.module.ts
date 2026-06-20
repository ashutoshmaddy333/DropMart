import { Module } from "@nestjs/common";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";
import { TrackingModule } from "../tracking/tracking.module";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [TrackingModule, NotificationsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
