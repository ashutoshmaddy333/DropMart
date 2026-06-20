import { Type } from "class-transformer";
import { IsArray, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from "class-validator";

class CheckoutItemDto {
  @IsString() productId!: string;
  @IsNumber() @Min(1) quantity!: number;
  @IsOptional() @IsString() variant?: string;
}

class CheckoutAddressDto {
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

export class CheckoutDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => CheckoutItemDto)
  items!: CheckoutItemDto[];

  @ValidateNested() @Type(() => CheckoutAddressDto)
  address!: CheckoutAddressDto;

  @IsString() @IsIn(["razorpay_checkout", "razorpay_qr", "cod"])
  paymentMode!: "razorpay_checkout" | "razorpay_qr" | "cod";
}

export class VerifyPaymentDto {
  @IsString() orderId!: string;
  @IsString() razorpayOrderId!: string;
  @IsString() razorpayPaymentId!: string;
  @IsString() razorpaySignature!: string;
}
