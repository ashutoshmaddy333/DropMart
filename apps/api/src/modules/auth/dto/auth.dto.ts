import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from "class-validator";

export class LoginDto {
  @IsEmail({}, { message: "Enter a valid email address" })
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

export class SendRegistrationOtpDto {
  @IsEmail({}, { message: "Enter a valid email address" })
  email!: string;
}

export class RegisterCustomerDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail({}, { message: "Enter a valid email address" })
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  @Matches(/^\d{6}$/, { message: "Enter the 6-digit verification code" })
  otp!: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class RegisterSupplierDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail({}, { message: "Enter a valid email address" })
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  @Matches(/^\d{6}$/, { message: "Enter the 6-digit verification code" })
  otp!: string;

  @IsString()
  @IsNotEmpty()
  businessName!: string;

  @IsString()
  @IsNotEmpty()
  warehouseCity!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  gstNumber?: string;

  @IsOptional()
  @IsString()
  address?: string;
}
