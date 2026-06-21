import { IsArray, IsBoolean, IsInt, IsOptional, IsString, Matches, Min } from "class-validator";

export class CreateRoleDto {
  @IsString()
  @Matches(/^[a-z][a-z0-9_]*$/, { message: "code must be lowercase snake_case" })
  code!: string;

  @IsString()
  label!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissionIds?: string[];
}

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissionIds?: string[];
}

export class SetRolePermissionsDto {
  @IsArray()
  @IsString({ each: true })
  permissionIds!: string[];
}

export class CreatePermissionDto {
  @IsString()
  @Matches(/^[a-z][a-z0-9:_-]*$/, { message: "code must be lowercase with colons" })
  code!: string;

  @IsString()
  label!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  groupId!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdatePermissionDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  groupId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
