import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ArrayMinSize, ArrayMaxSize } from "class-validator";

export class CreateProductDto {
  @IsString() @IsNotEmpty() name!: string;
  @IsString() @IsNotEmpty() description!: string;
  @IsString() @IsNotEmpty() shortDescription!: string;
  @IsString() @IsNotEmpty() categorySlug!: string;
  @IsOptional() @IsString() brand?: string;
  @IsNumber() @Min(0.01) price!: number;
  @IsNumber() @Min(0.01) mrp!: number;
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(6) @IsString({ each: true }) images!: string[];
  @IsNumber() @Min(1) stockCount!: number;
  @IsString() @IsNotEmpty() warehouseCity!: string;
  @IsNumber() @Min(1) deliveryDays!: number;
  @IsOptional() @IsArray() @IsString({ each: true }) features?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsBoolean() isFlashDeal?: boolean;
}

export class UploadProductImageDto {
  @IsString() @IsNotEmpty() image!: string;
  @IsOptional() @IsString() filename?: string;
}

export class ApproveProductDto {
  @IsString() action!: "approve" | "reject";
  @IsOptional() @IsString() note?: string;
}
