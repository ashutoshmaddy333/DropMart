import { Module, forwardRef } from "@nestjs/common";
import { DeliveryController } from "./delivery.controller";
import { DeliveryService } from "./delivery.service";
import { TrackingModule } from "../tracking/tracking.module";

@Module({
  imports: [forwardRef(() => TrackingModule)],
  controllers: [DeliveryController],
  providers: [DeliveryService],
  exports: [DeliveryService],
})
export class DeliveryModule {}
