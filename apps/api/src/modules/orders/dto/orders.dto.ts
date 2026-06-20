import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from "class-validator";

class OrderItemDto {
  @IsString() productId!: string;
  @IsNumber() @Min(1) quantity!: number;
  @IsOptional() @IsString() variant?: string;
}

class OrderAddressDto {
  @IsString() name!: string;
  @IsString() phone!: string;
  @IsString() line1!: string;
  @IsOptional() @IsString() line2?: string;
  @IsString() city!: string;
  @IsString() state!: string;
  @IsString() pincode!: string;
  @IsOptional() @IsNumber() lat?: number;
  @IsOptional() @IsNumber() lng?: number;
}

export class CreateOrderDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  @ValidateNested() @Type(() => OrderAddressDto)
  address!: OrderAddressDto;

  @IsString() paymentMethodCode!: string;
}
