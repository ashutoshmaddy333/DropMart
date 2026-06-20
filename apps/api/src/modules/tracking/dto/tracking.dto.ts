import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateLocationDto {
  @IsString() assignmentId!: string;
  @IsNumber() lat!: number;
  @IsNumber() lng!: number;
  @IsOptional() @IsNumber() heading?: number;
  @IsOptional() @IsNumber() speed?: number;
}
