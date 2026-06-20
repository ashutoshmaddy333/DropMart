import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { SuppliersService } from "./suppliers.service";
import { AuthGuard } from "../../common/guards/auth.guard";
import { RequirePermissions } from "../../common/decorators/auth.decorators";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { RequestUser } from "../../common/decorators/auth.decorators";
import { IsOptional, IsString } from "class-validator";

class VerifySupplierDto {
  @IsString()
  action!: "verify" | "reject";

  @IsOptional()
  @IsString()
  note?: string;
}

@Controller("suppliers")
@UseGuards(AuthGuard)
export class SuppliersController {
  constructor(private suppliersService: SuppliersService) {}

  @Get("me")
  @RequirePermissions("supplier:read:own")
  getMySupplier(@CurrentUser() user: RequestUser) {
    return this.suppliersService.getMySupplier(user.id);
  }

  @Get("me/dashboard")
  @RequirePermissions("supplier:read:own")
  getDashboard(@CurrentUser() user: RequestUser) {
    return this.suppliersService.getDashboard(user.id);
  }

  @Get()
  @RequirePermissions("supplier:manage")
  listAll() {
    return this.suppliersService.listAll();
  }

  @Get("pending")
  @RequirePermissions("supplier:verify")
  listPending() {
    return this.suppliersService.listPending();
  }

  @Patch(":id/verify")
  @RequirePermissions("supplier:verify")
  verify(
    @Param("id") id: string,
    @Body() dto: VerifySupplierDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.suppliersService.verify(id, dto.action, user.id, dto.note);
  }
}
