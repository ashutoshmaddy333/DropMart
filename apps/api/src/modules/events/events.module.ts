import { Module } from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { KafkaService } from "./kafka.service";
import { OrderEventsService } from "./order-events.service";
import { OrderEventsHandlers } from "./order-events.handlers";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    NotificationsModule,
  ],
  providers: [KafkaService, OrderEventsService, OrderEventsHandlers],
  exports: [OrderEventsService, KafkaService],
})
export class EventsModule {}
