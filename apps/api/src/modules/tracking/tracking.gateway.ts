import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Injectable, forwardRef, Inject } from "@nestjs/common";
import { TrackingService } from "./tracking.service";
import { LocationService } from "./location.service";

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN?.split(",") ?? "*",
    credentials: true,
  },
  namespace: "/tracking",
})
export class TrackingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private trackingService: TrackingService,
    @Inject(forwardRef(() => LocationService))
    private locationService: LocationService,
  ) {}

  handleConnection(client: Socket) {
    console.log(`Tracking client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Tracking client disconnected: ${client.id}`);
  }

  @SubscribeMessage("join_order")
  async handleJoinOrder(client: Socket, orderId: string) {
    client.join(`order:${orderId}`);
    const delivery = await this.trackingService.getDeliveryData(orderId);
    if (delivery) client.emit("tracking_update", delivery);
    return { joined: orderId };
  }

  @SubscribeMessage("update_location")
  async handleUpdateLocation(
    client: Socket,
    payload: {
      userId: string;
      assignmentId: string;
      lat: number;
      lng: number;
      heading?: number;
      speed?: number;
    },
  ) {
    const update = await this.locationService.ingestLocation(payload.userId, payload);
    this.broadcastToOrder(update.orderId, update);
    return update;
  }

  broadcastToOrder(orderId: string, update: object) {
    this.server.to(`order:${orderId}`).emit("tracking_update", update);
  }

  broadcastOrderStatus(orderId: string, order: object) {
    this.server.to(`order:${orderId}`).emit("order_status_update", order);
  }

  async getDeliveryData(orderId: string) {
    return this.trackingService.getDeliveryData(orderId);
  }
}
