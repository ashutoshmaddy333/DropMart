import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { mkdirSync, writeFileSync } from "fs";
import { join, extname } from "path";
import { randomUUID } from "crypto";
import { PrismaService } from "../../prisma/prisma.module";
import { CreateProductDto } from "./dto/products.dto";
import { RequestUser } from "../../common/decorators/auth.decorators";
import { NotificationsService } from "../notifications/notifications.service";
import { productSubmittedEmail, productApprovedEmail, productRejectedEmail } from "../notifications/email-templates";

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  saveProductImageFromBase64(image: string, filename?: string) {
    const MAX_BYTES = 5 * 1024 * 1024;
    let mime = "image/jpeg";
    let base64Data = image.trim();

    const dataUrlMatch = /^data:(image\/(?:jpeg|jpg|png|webp));base64,(.+)$/i.exec(base64Data);
    if (dataUrlMatch) {
      mime = dataUrlMatch[1].toLowerCase();
      base64Data = dataUrlMatch[2];
    }

    let buffer: Buffer;
    try {
      buffer = Buffer.from(base64Data, "base64");
    } catch {
      throw new BadRequestException("Invalid base64 image data");
    }

    if (!buffer.length) throw new BadRequestException("Empty image data");
    if (buffer.length > MAX_BYTES) {
      throw new BadRequestException("Image must be under 5MB");
    }

    const extMap: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/jpg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
    };
    const ext = extMap[mime] ?? (extname(filename ?? "").toLowerCase() || ".jpg");
    const allowed = [".jpg", ".jpeg", ".png", ".webp"];
    if (!allowed.includes(ext)) throw new BadRequestException("Only JPEG, PNG, WebP allowed");

    const uploadDir = join(process.cwd(), "../web/public/uploads/products");
    mkdirSync(uploadDir, { recursive: true });

    const savedName = `${randomUUID()}${ext === ".jpeg" ? ".jpg" : ext}`;
    writeFileSync(join(uploadDir, savedName), buffer);

    return { url: `/uploads/products/${savedName}` };
  }

  async list(filters: { q?: string; category?: string; flashDeals?: boolean; featured?: boolean }) {
    const approvedStatus = await this.prisma.masterProductStatus.findUnique({ where: { code: "approved" } });
    if (!approvedStatus) return [];

    const where: Record<string, unknown> = { statusId: approvedStatus.id, inStock: true };
    if (filters.category) where.category = { slug: filters.category };
    if (filters.flashDeals) where.isFlashDeal = true;
    if (filters.featured) where.isFeatured = true;
    if (filters.q) {
      where.OR = [
        { name: { contains: filters.q, mode: "insensitive" } },
        { brand: { contains: filters.q, mode: "insensitive" } },
        { tags: { has: filters.q.toLowerCase() } },
      ];
    }

    const products = await this.prisma.product.findMany({
      where,
      include: { category: true, supplier: { select: { businessName: true } }, status: true },
      orderBy: { createdAt: "desc" },
    });

    return products.map((p) => this.formatProduct(p));
  }

  async getBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        supplier: { select: { businessName: true, warehouseCity: true } },
        status: true,
        variants: true,
      },
    });
    if (!product) throw new NotFoundException("Product not found");
    if (product.status.code !== "approved") throw new NotFoundException("Product not available");
    return this.formatProduct(product);
  }

  async create(dto: CreateProductDto, user: RequestUser) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { userId: user.id },
      include: { status: true },
    });
    if (!supplier) throw new ForbiddenException("Supplier profile required");
    if (supplier.status.code !== "verified") {
      throw new ForbiddenException("Supplier must be verified before adding products");
    }

    const category = await this.prisma.masterCategory.findUnique({ where: { slug: dto.categorySlug } });
    if (!category) throw new BadRequestException("Invalid category");

    const status = await this.prisma.masterProductStatus.findUnique({ where: { code: "pending_approval" } });
    if (!status) throw new BadRequestException("Product status not configured");

    if (dto.mrp < dto.price) {
      throw new BadRequestException("MRP must be greater than or equal to selling price");
    }

    const slug = dto.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const product = await this.prisma.product.create({
      data: {
        slug: `${slug}-${Date.now()}`,
        name: dto.name,
        description: dto.description,
        shortDescription: dto.shortDescription,
        brand: dto.brand,
        price: dto.price,
        mrp: dto.mrp,
        images: dto.images,
        stockCount: dto.stockCount,
        inStock: dto.stockCount > 0,
        warehouseCity: dto.warehouseCity,
        deliveryDays: dto.deliveryDays ?? 3,
        features: dto.features ?? [],
        tags: dto.tags ?? [],
        isFlashDeal: dto.isFlashDeal ?? false,
        supplierId: supplier.id,
        categoryId: category.id,
        statusId: status.id,
      },
      include: { category: true, supplier: true, status: true },
    });

    const adminBase = process.env.ADMIN_APP_URL ?? process.env.CORS_ORIGIN ?? "http://localhost:3000";
    const email = productSubmittedEmail({
      productName: product.name,
      supplierName: supplier.businessName,
      price: Number(product.price),
      category: category.name,
      adminUrl: `${adminBase}/admin/products`,
    });

    await this.notifications.notifyAdmins({
      type: "product_submitted",
      title: "New Product Pending Approval",
      message: `${supplier.businessName} submitted "${product.name}" for approval.`,
      link: "/admin/products",
      metadata: {
        productId: product.id,
        productName: product.name,
        supplierName: supplier.businessName,
      },
      emailSubject: email.subject,
      emailHtml: email.html,
      emailText: email.text,
    });

    return this.formatProduct(product);
  }

  async getSupplierProducts(userId: string) {
    const supplier = await this.prisma.supplier.findUnique({ where: { userId } });
    if (!supplier) throw new NotFoundException("Supplier not found");

    const products = await this.prisma.product.findMany({
      where: { supplierId: supplier.id },
      include: { category: true, status: true },
      orderBy: { createdAt: "desc" },
    });
    return products.map((p) => this.formatProduct(p));
  }

  async getPendingApproval() {
    const products = await this.prisma.product.findMany({
      where: { status: { code: "pending_approval" } },
      include: { category: true, supplier: { include: { user: { select: { name: true, email: true } } } }, status: true },
      orderBy: { createdAt: "desc" },
    });
    return products.map((p) => this.formatProduct(p, true));
  }

  async getAllForAdmin() {
    const products = await this.prisma.product.findMany({
      include: { category: true, supplier: { include: { user: { select: { name: true, email: true } } } }, status: true },
      orderBy: { createdAt: "desc" },
    });
    return products.map((p) => this.formatProduct(p, true));
  }

  async approve(productId: string, action: "approve" | "reject", adminId: string, note?: string) {
    const existing = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { status: true },
    });
    if (!existing) throw new NotFoundException("Product not found");
    if (existing.status.code !== "pending_approval") {
      throw new BadRequestException("Product is not pending approval");
    }

    const statusCode = action === "approve" ? "approved" : "rejected";
    const status = await this.prisma.masterProductStatus.findUnique({ where: { code: statusCode } });
    if (!status) throw new BadRequestException("Invalid status");

    const product = await this.prisma.product.update({
      where: { id: productId },
      data: {
        statusId: status.id,
        approvedAt: action === "approve" ? new Date() : null,
        approvedById: action === "approve" ? adminId : null,
        rejectionNote: action === "reject" ? note : null,
      },
      include: {
        category: true,
        supplier: { include: { user: { select: { id: true, name: true, email: true } } } },
        status: true,
      },
    });

    const appBase = process.env.ADMIN_APP_URL ?? process.env.CORS_ORIGIN ?? "http://localhost:3000";

    if (action === "approve") {
      const email = productApprovedEmail({
        productName: product.name,
        supplierName: product.supplier.businessName,
        price: Number(product.price),
        storefrontUrl: `${appBase}/products/${product.slug}`,
      });
      await this.notifications.notifyUser({
        userId: product.supplier.user.id,
        email: product.supplier.user.email,
        type: "product_approved",
        title: "Product Approved",
        message: `Your product "${product.name}" is now live on the storefront.`,
        link: "/supplier/products",
        metadata: { productId: product.id, productName: product.name },
        emailSubject: email.subject,
        emailHtml: email.html,
        emailText: email.text,
      });
    } else {
      const email = productRejectedEmail({
        productName: product.name,
        supplierName: product.supplier.businessName,
        note,
        supplierUrl: `${appBase}/supplier/products`,
      });
      await this.notifications.notifyUser({
        userId: product.supplier.user.id,
        email: product.supplier.user.email,
        type: "product_rejected",
        title: "Product Not Approved",
        message: note
          ? `Your product "${product.name}" was not approved. Reason: ${note}`
          : `Your product "${product.name}" was not approved.`,
        link: "/supplier/products",
        metadata: { productId: product.id, productName: product.name, note },
        emailSubject: email.subject,
        emailHtml: email.html,
        emailText: email.text,
      });
    }

    return this.formatProduct(product, true);
  }

  private formatProduct(
    product: {
    id: string; slug: string; name: string; description: string; shortDescription: string;
    brand: string | null; price: unknown; mrp: unknown; images: string[];
    rating: number; reviewCount: number; inStock: boolean; stockCount: number;
    features: string[]; warehouseCity: string; deliveryDays: number;
    isFeatured: boolean; isFlashDeal: boolean; flashDealEndsAt: Date | null;
    tags: string[]; rejectionNote?: string | null; createdAt?: Date;
    category: { slug: string; name: string };
    supplier?: {
      businessName: string;
      warehouseCity?: string;
      user?: { id?: string; name: string; email: string };
    } | null;
    status: { code: string; label: string; color: string | null };
    variants?: { id: string; label: string; value: string; inStock: boolean }[];
  },
    includeAdminFields = false,
  ) {
    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      shortDescription: product.shortDescription,
      brand: product.brand,
      price: Number(product.price),
      mrp: Number(product.mrp),
      images: product.images,
      rating: product.rating,
      reviewCount: product.reviewCount,
      inStock: product.inStock,
      stockCount: product.stockCount,
      features: product.features,
      warehouseCity: product.warehouseCity,
      deliveryDays: product.deliveryDays,
      isFeatured: product.isFeatured,
      isFlashDeal: product.isFlashDeal,
      flashDealEndsAt: product.flashDealEndsAt,
      tags: product.tags,
      category: product.category.name,
      categorySlug: product.category.slug,
      supplierName: product.supplier?.businessName,
      status: product.status.code,
      statusLabel: product.status.label,
      statusColor: product.status.color,
      rejectionNote: product.rejectionNote,
      variants: product.variants ?? [],
      ...(includeAdminFields && product.supplier?.user
        ? {
            supplierContact: product.supplier.user.name,
            supplierEmail: product.supplier.user.email,
          }
        : {}),
      ...(includeAdminFields && product.createdAt
        ? { createdAt: product.createdAt.toISOString() }
        : {}),
    };
  }
}
