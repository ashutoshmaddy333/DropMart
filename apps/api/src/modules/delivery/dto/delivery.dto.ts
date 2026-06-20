import { IsNumber, IsOptional, IsString } from "class-validator";

export class AssignDeliveryDto {
  @IsString() orderId!: string;
  @IsString() deliveryBoyId!: string;
  @IsOptional() @IsNumber() pickupLat?: number;
  @IsOptional() @IsNumber() pickupLng?: number;
  @IsOptional() @IsNumber() dropLat?: number;
  @IsOptional() @IsNumber() dropLng?: number;
  @IsOptional() @IsNumber() estimatedMins?: number;
}

export class UpdateDeliveryStatusDto {
  @IsString() statusCode!: string;
}
