import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { RbacService } from "./rbac.service";
import { AuthGuard } from "../../common/guards/auth.guard";
import { RequirePermissions } from "../../common/decorators/auth.decorators";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { RequestUser } from "../../common/decorators/auth.decorators";
import {
  CreatePermissionDto,
  CreateRoleDto,
  SetRolePermissionsDto,
  UpdatePermissionDto,
  UpdateRoleDto,
} from "./dto/rbac.dto";

@Controller("rbac")
@UseGuards(AuthGuard)
@RequirePermissions("rbac:manage")
export class RbacController {
  constructor(private rbacService: RbacService) {}

  @Get("roles")
  listRoles() {
    return this.rbacService.listRoles();
  }

  @Get("roles/:id")
  getRole(@Param("id") id: string) {
    return this.rbacService.getRole(id);
  }

  @Post("roles")
  createRole(@Body() dto: CreateRoleDto, @CurrentUser() user: RequestUser) {
    return this.rbacService.createRole(dto, user.id);
  }

  @Patch("roles/:id")
  updateRole(
    @Param("id") id: string,
    @Body() dto: UpdateRoleDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.rbacService.updateRole(id, dto, user.id);
  }

  @Put("roles/:id/permissions")
  setRolePermissions(
    @Param("id") id: string,
    @Body() dto: SetRolePermissionsDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.rbacService.replaceRolePermissions(id, dto, user.id);
  }

  @Delete("roles/:id")
  deleteRole(@Param("id") id: string) {
    return this.rbacService.deleteRole(id);
  }

  @Get("permissions")
  listPermissions() {
    return this.rbacService.listPermissions();
  }

  @Post("permissions")
  createPermission(@Body() dto: CreatePermissionDto) {
    return this.rbacService.createPermission(dto);
  }

  @Patch("permissions/:id")
  updatePermission(@Param("id") id: string, @Body() dto: UpdatePermissionDto) {
    return this.rbacService.updatePermission(id, dto);
  }

  @Delete("permissions/:id")
  deletePermission(@Param("id") id: string) {
    return this.rbacService.deletePermission(id);
  }
}
