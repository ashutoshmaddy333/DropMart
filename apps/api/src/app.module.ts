import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { MastersModule } from "./modules/masters/masters.module";
import { SuppliersModule } from "./modules/suppliers/suppliers.module";
import { ProductsModule } from "./modules/products/products.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { TrackingModule } from "./modules/tracking/tracking.module";
import { UsersModule } from "./modules/users/users.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { MailModule } from "./modules/mail/mail.module";
import { RedisModule } from "./redis/redis.module";
import { DeliveryModule } from "./modules/delivery/delivery.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { EventsModule } from "./modules/events/events.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RedisModule,
    PrismaModule,
    EventsModule,
    AuthModule,
    MastersModule,
    SuppliersModule,
    ProductsModule,
    OrdersModule,
    TrackingModule,
    DeliveryModule,
    PaymentsModule,
    UsersModule,
    NotificationsModule,
    MailModule,
  ],
})
export class AppModule {}
