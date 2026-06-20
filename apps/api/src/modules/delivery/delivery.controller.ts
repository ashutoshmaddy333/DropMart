import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { DeliveryService } from "./delivery.service";
import { AuthGuard } from "../../common/guards/auth.guard";
import { RequirePermissions } from "../../common/decorators/auth.decorators";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { RequestUser } from "../../common/decorators/auth.decorators";
import { AssignDeliveryDto, UpdateDeliveryStatusDto } from "./dto/delivery.dto";

@Controller("delivery")
@UseGuards(AuthGuard)
export class DeliveryController {
  constructor(private deliveryService: DeliveryService) {}

  @Get("boys")
  @RequirePermissions("order:process")
  listBoys() {
    return this.deliveryService.listDeliveryBoys();
  }

  @Post("assign")
  @RequirePermissions("order:process")
  assign(@Body() dto: AssignDeliveryDto) {
    return this.deliveryService.assign(dto);
  }

  @Get("my-assignments")
  @RequirePermissions("delivery:update")
  myAssignments(@CurrentUser() user: RequestUser) {
    return this.deliveryService.getMyAssignments(user.id);
  }

  @Patch(":assignmentId/status")
  @RequirePermissions("delivery:update")
  updateStatus(
    @Param("assignmentId") assignmentId: string,
    @Body() dto: UpdateDeliveryStatusDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.deliveryService.updateStatus(assignmentId, user.id, dto.statusCode);
  }
}
