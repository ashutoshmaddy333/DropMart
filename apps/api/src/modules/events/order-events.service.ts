import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { KafkaService } from "./kafka.service";
import type { OrderEventPayload } from "./order-events.types";

export const ORDER_EVENTS_TOPIC = "order-events";

@Injectable()
export class OrderEventsService {
  private readonly logger = new Logger(OrderEventsService.name);

  constructor(
    private kafka: KafkaService,
    private events: EventEmitter2,
  ) {}

  async emit(payload: OrderEventPayload) {
    const published = await this.kafka.publish(ORDER_EVENTS_TOPIC, payload, payload.orderId);
    if (published) {
      this.logger.debug(`Kafka → ${ORDER_EVENTS_TOPIC}: ${payload.type} (${payload.orderNumber})`);
    }

    this.events.emit(payload.type, payload);
    this.events.emit("order.event", payload);
  }
}
