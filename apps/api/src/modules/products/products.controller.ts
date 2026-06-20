import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ProductsService } from "./products.service";
import { AuthGuard } from "../../common/guards/auth.guard";
import { Public, RequirePermissions } from "../../common/decorators/auth.decorators";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { RequestUser } from "../../common/decorators/auth.decorators";
import { ApproveProductDto, CreateProductDto, UploadProductImageDto } from "./dto/products.dto";

@Controller("products")
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Public()
  @Get()
  list(
    @Query("q") q?: string,
    @Query("category") category?: string,
    @Query("flashDeals") flashDeals?: string,
    @Query("featured") featured?: string,
  ) {
    return this.productsService.list({ q, category, flashDeals: flashDeals === "true", featured: featured === "true" });
  }

  @Get("supplier/mine")
  @UseGuards(AuthGuard)
  @RequirePermissions("supplier:read:own")
  myProducts(@CurrentUser() user: RequestUser) {
    return this.productsService.getSupplierProducts(user.id);
  }

  @Get("admin/pending")
  @UseGuards(AuthGuard)
  @RequirePermissions("product:approve")
  pendingApproval() {
    return this.productsService.getPendingApproval();
  }

  @Get("admin/all")
  @UseGuards(AuthGuard)
  @RequirePermissions("product:approve")
  allForAdmin() {
    return this.productsService.getAllForAdmin();
  }

  @Post("upload-image")
  @UseGuards(AuthGuard)
  @RequirePermissions("product:create")
  uploadImage(@Body() dto: UploadProductImageDto) {
    return this.productsService.saveProductImageFromBase64(dto.image, dto.filename);
  }

  @Public()
  @Get(":slug")
  getBySlug(@Param("slug") slug: string) {
    return this.productsService.getBySlug(slug);
  }

  @Post()
  @UseGuards(AuthGuard)
  @RequirePermissions("product:create")
  create(@Body() dto: CreateProductDto, @CurrentUser() user: RequestUser) {
    return this.productsService.create(dto, user);
  }

  @Patch(":id/approve")
  @UseGuards(AuthGuard)
  @RequirePermissions("product:approve")
  approve(
    @Param("id") id: string,
    @Body() dto: ApproveProductDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.productsService.approve(id, dto.action, user.id, dto.note);
  }
}
