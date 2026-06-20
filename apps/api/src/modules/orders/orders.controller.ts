import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { AuthGuard } from "../../common/guards/auth.guard";
import { RequirePermissions } from "../../common/decorators/auth.decorators";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { RequestUser } from "../../common/decorators/auth.decorators";
import { CreateOrderDto } from "./dto/orders.dto";

@Controller("orders")
@UseGuards(AuthGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @RequirePermissions("order:read:own")
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: RequestUser) {
    return this.ordersService.create(dto, user.id);
  }

  @Get("me")
  @RequirePermissions("order:read:own")
  myOrders(@CurrentUser() user: RequestUser) {
    return this.ordersService.getMyOrders(user);
  }

  @Get("supplier/mine")
  @RequirePermissions("supplier:read:own")
  supplierOrders(@CurrentUser() user: RequestUser) {
    return this.ordersService.getSupplierOrders(user.id);
  }

  @Get()
  @RequirePermissions("order:read")
  listAll() {
    return this.ordersService.listAll();
  }

  @Get(":id")
  @RequirePermissions("order:read", "order:read:own")
  getById(@Param("id") id: string, @CurrentUser() user: RequestUser) {
    return this.ordersService.getById(id, user);
  }

  @Patch(":id/status")
  @RequirePermissions("order:process")
  updateStatus(
    @Param("id") id: string,
    @Body("statusCode") statusCode: string,
  ) {
    return this.ordersService.updateStatus(id, statusCode);
  }

  @Patch(":id/pack")
  @RequirePermissions("supplier:read:own")
  markPacked(@Param("id") id: string, @CurrentUser() user: RequestUser) {
    return this.ordersService.markPacked(id, user.id);
  }
}
