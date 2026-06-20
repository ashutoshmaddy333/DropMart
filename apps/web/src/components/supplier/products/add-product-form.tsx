"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Icon } from "@/components/shared/icon";
import { useAppSelector } from "@/store/hooks";
import { apiFetch } from "@/lib/api/client";
import { CITIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const MIN_IMAGES = 1;
const MAX_IMAGES = 6;
const MAX_FILE_MB = 5;

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read image file"));
    reader.readAsDataURL(file);
  });
}

const DEFAULT_CATEGORIES = [
  { slug: "electronics", name: "Electronics" },
  { slug: "kitchen", name: "Kitchen" },
  { slug: "fitness", name: "Fitness" },
  { slug: "home-decor", name: "Home Decor" },
  { slug: "fashion", name: "Fashion" },
  { slug: "beauty", name: "Beauty" },
];

function FieldLabel({
  htmlFor,
  required,
  children,
  hint,
}: {
  htmlFor?: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={htmlFor} className="flex flex-wrap items-center gap-1">
        <span>{children}</span>
        {required ? (
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="text-xs font-normal text-muted-foreground">(optional)</span>
        )}
      </Label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

interface FormState {
  name: string;
  shortDescription: string;
  description: string;
  categorySlug: string;
  brand: string;
  price: string;
  mrp: string;
  stockCount: string;
  warehouseCity: string;
  deliveryDays: string;
  imageUrl: string;
  features: string;
  tags: string;
  isFlashDeal: boolean;
}

const INITIAL: FormState = {
  name: "",
  shortDescription: "",
  description: "",
  categorySlug: "electronics",
  brand: "",
  price: "",
  mrp: "",
  stockCount: "",
  warehouseCity: "Mumbai",
  deliveryDays: "3",
  imageUrl: "",
  features: "",
  tags: "",
  isFlashDeal: false,
};

export function AddProductForm() {
  const { token, user } = useAppSelector((s) => s.auth);
  const { data: masters } = useAppSelector((s) => s.masters);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState | "images", string>>>({});

  const categories = masters?.categories?.length ? masters.categories : DEFAULT_CATEGORIES;
  const discount = useMemo(() => {
    const price = Number(form.price);
    const mrp = Number(form.mrp);
    if (!price || !mrp || mrp <= price) return 0;
    return Math.round(((mrp - price) / mrp) * 100);
  }, [form.price, form.mrp]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function uploadFile(file: File) {
    if (!token) {
      toast.error("Please log in as a supplier");
      return;
    }
    if (selectedImages.length >= MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      toast.error(`Image must be under ${MAX_FILE_MB}MB`);
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(file.type)) {
      toast.error("Use JPEG, PNG, or WebP images only");
      return;
    }

    setUploading(true);
    try {
      const image = await readFileAsBase64(file);
      const { url } = await apiFetch<{ url: string }>("/products/upload-image", {
        method: "POST",
        token,
        body: JSON.stringify({ image, filename: file.name }),
      });
      setSelectedImages((prev) => (prev.includes(url) ? prev : [...prev, url]));
      setErrors((prev) => ({ ...prev, images: undefined }));
      toast.success("Image uploaded");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function addImageUrl() {
    const url = form.imageUrl.trim();
    if (!url) {
      setErrors((prev) => ({ ...prev, imageUrl: "Enter an image URL or upload a file" }));
      return;
    }
    if (selectedImages.length >= MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }
    if (selectedImages.includes(url)) {
      toast.error("Image already added");
      return;
    }
    setSelectedImages((prev) => [...prev, url]);
    update("imageUrl", "");
    setErrors((prev) => ({ ...prev, images: undefined }));
  }

  function removeImage(url: string) {
    if (selectedImages.length <= MIN_IMAGES) {
      toast.error(`At least ${MIN_IMAGES} product image is required`);
      return;
    }
    setSelectedImages((prev) => prev.filter((i) => i !== url));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState | "images", string>> = {};
    const price = Number(form.price);
    const mrp = Number(form.mrp);
    const stockCount = Number(form.stockCount);
    const deliveryDays = Number(form.deliveryDays);

    if (!form.name.trim()) next.name = "Product name is required";
    if (!form.shortDescription.trim()) next.shortDescription = "Short description is required";
    if (!form.description.trim()) next.description = "Full description is required";
    if (!form.categorySlug) next.categorySlug = "Category is required";
    if (!price || price <= 0) next.price = "Enter a valid selling price";
    if (!mrp || mrp <= 0) next.mrp = "Enter a valid MRP";
    if (mrp > 0 && price > 0 && mrp < price) next.mrp = "MRP must be ≥ selling price";
    if (!stockCount || stockCount < 1) next.stockCount = "Stock must be at least 1";
    if (!form.warehouseCity) next.warehouseCity = "Warehouse city is required";
    if (!deliveryDays || deliveryDays < 1) next.deliveryDays = "Delivery days must be at least 1";
    if (selectedImages.length < MIN_IMAGES) {
      next.images = `Add at least ${MIN_IMAGES} product image (upload or URL)`;
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      toast.error("Please log in as a supplier");
      router.push("/login?redirect=/supplier/products/new");
      return;
    }
    if (!validate()) {
      toast.error("Please fix the highlighted required fields");
      return;
    }

    const price = Number(form.price);
    const mrp = Number(form.mrp);
    const stockCount = Number(form.stockCount);

    setLoading(true);
    try {
      await apiFetch("/products", {
        method: "POST",
        token,
        body: JSON.stringify({
          name: form.name.trim(),
          shortDescription: form.shortDescription.trim(),
          description: form.description.trim(),
          categorySlug: form.categorySlug,
          brand: form.brand.trim() || undefined,
          price,
          mrp,
          stockCount,
          warehouseCity: form.warehouseCity,
          deliveryDays: Number(form.deliveryDays) || 3,
          images: selectedImages,
          features: form.features.split(",").map((f) => f.trim()).filter(Boolean),
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
          isFlashDeal: form.isFlashDeal,
        }),
      });

      toast.success("Product submitted for approval", {
        description: "Admins will review it. Once approved, it appears on the customer storefront.",
      });
      router.push("/supplier/products");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit product");
    } finally {
      setLoading(false);
    }
  }

  const inputError = (key: keyof FormState | "images") =>
    errors[key] ? "border-destructive focus-visible:ring-destructive" : "";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add New Product</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Fields marked with <span className="text-destructive">*</span> are required. List a product for{" "}
            {user?.supplier?.businessName ?? "your store"}.
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push("/supplier/products")}>
          Back to Products
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Icon name="cube" size={18} className="text-brand" />
            Basic Details
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <FieldLabel htmlFor="name" required>
                Product Name
              </FieldLabel>
              <Input
                id="name"
                placeholder="e.g. Wireless Noise-Cancelling Headphones"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className={inputError("name")}
                required
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="category" required>
                Category
              </FieldLabel>
              <select
                id="category"
                className={cn(
                  "flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm",
                  inputError("categorySlug"),
                )}
                value={form.categorySlug}
                onChange={(e) => update("categorySlug", e.target.value)}
                required
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="brand">Brand</FieldLabel>
              <Input
                id="brand"
                placeholder="e.g. DropMart Essentials"
                value={form.brand}
                onChange={(e) => update("brand", e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <FieldLabel htmlFor="shortDescription" required hint="Shown on product cards in the storefront">
                Short Description
              </FieldLabel>
              <Input
                id="shortDescription"
                placeholder="One-line summary (max ~120 characters works best)"
                value={form.shortDescription}
                onChange={(e) => update("shortDescription", e.target.value)}
                className={inputError("shortDescription")}
                required
              />
              {errors.shortDescription && (
                <p className="text-xs text-destructive">{errors.shortDescription}</p>
              )}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <FieldLabel htmlFor="description" required>
                Full Description
              </FieldLabel>
              <Textarea
                id="description"
                rows={4}
                placeholder="Detailed product description for the product page"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                className={inputError("description")}
                required
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
            </div>
          </div>
        </section>

        <section className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Icon name="credit-card" size={18} className="text-brand" />
            Pricing & Inventory
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <FieldLabel htmlFor="price" required>
                Selling Price (₹)
              </FieldLabel>
              <Input
                id="price"
                type="number"
                min={1}
                step="0.01"
                placeholder="1999"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                className={inputError("price")}
                required
              />
              {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="mrp" required hint="Must be ≥ selling price">
                MRP (₹)
              </FieldLabel>
              <Input
                id="mrp"
                type="number"
                min={1}
                step="0.01"
                placeholder="2999"
                value={form.mrp}
                onChange={(e) => update("mrp", e.target.value)}
                className={inputError("mrp")}
                required
              />
              {errors.mrp && <p className="text-xs text-destructive">{errors.mrp}</p>}
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="stock" required>
                Stock Quantity
              </FieldLabel>
              <Input
                id="stock"
                type="number"
                min={1}
                placeholder="50"
                value={form.stockCount}
                onChange={(e) => update("stockCount", e.target.value)}
                className={inputError("stockCount")}
                required
              />
              {errors.stockCount && <p className="text-xs text-destructive">{errors.stockCount}</p>}
            </div>
          </div>
          {discount > 0 && (
            <p className="mt-3 text-sm text-emerald-600">{discount}% discount will show on the storefront</p>
          )}
        </section>

        <section className="rounded-xl border bg-card p-6">
          <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold">
            <Icon name="cube" size={18} className="text-brand" />
            Product Images
            <span className="text-destructive">*</span>
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Minimum <strong>{MIN_IMAGES}</strong> image, maximum <strong>{MAX_IMAGES}</strong>. First image is the
            main photo on product cards. JPEG, PNG, or WebP — up to {MAX_FILE_MB}MB each.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadFile(file);
              }}
            />
            <Button
              type="button"
              variant="outline"
              disabled={uploading || selectedImages.length >= MAX_IMAGES}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? "Uploading..." : "Upload from device"}
            </Button>
            <span className="text-xs text-muted-foreground">
              {selectedImages.length}/{MAX_IMAGES} images added
            </span>
          </div>

          <div className="mt-4 flex gap-2">
            <Input
              placeholder="Or paste image URL (https://...)"
              value={form.imageUrl}
              onChange={(e) => update("imageUrl", e.target.value)}
              className={inputError("imageUrl")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addImageUrl();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addImageUrl}>
              Add URL
            </Button>
          </div>

          {selectedImages.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-3">
              {selectedImages.map((url, index) => (
                <div key={url} className="group relative">
                  <div className="relative h-24 w-24 overflow-hidden rounded-lg border">
                    <Image src={url} alt="" fill className="object-cover" sizes="96px" unoptimized={url.startsWith("http")} />
                  </div>
                  {index === 0 && (
                    <span className="absolute -left-1 -top-1 rounded bg-brand px-1.5 py-0.5 text-[10px] font-semibold text-brand-foreground">
                      Main
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No images yet — upload at least {MIN_IMAGES} photo of your product
            </div>
          )}
          {errors.images && <p className="mt-2 text-xs text-destructive">{errors.images}</p>}
        </section>

        <section className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Icon name="truck" size={18} className="text-brand" />
            Fulfillment
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel htmlFor="warehouse" required>
                Warehouse City
              </FieldLabel>
              <select
                id="warehouse"
                className={cn(
                  "flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm",
                  inputError("warehouseCity"),
                )}
                value={form.warehouseCity}
                onChange={(e) => update("warehouseCity", e.target.value)}
                required
              >
                {CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="deliveryDays" required>
                Delivery Days
              </FieldLabel>
              <Input
                id="deliveryDays"
                type="number"
                min={1}
                max={14}
                value={form.deliveryDays}
                onChange={(e) => update("deliveryDays", e.target.value)}
                className={inputError("deliveryDays")}
                required
              />
              {errors.deliveryDays && <p className="text-xs text-destructive">{errors.deliveryDays}</p>}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <FieldLabel htmlFor="features" hint="Separate with commas">
                Features
              </FieldLabel>
              <Input
                id="features"
                placeholder="Bluetooth 5.0, 30hr battery, Fast charging"
                value={form.features}
                onChange={(e) => update("features", e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <FieldLabel htmlFor="tags" hint="Separate with commas">
                Tags
              </FieldLabel>
              <Input
                id="tags"
                placeholder="audio, wireless, bestseller"
                value={form.tags}
                onChange={(e) => update("tags", e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4 sm:col-span-2">
              <div>
                <p className="font-medium">Flash Deal</p>
                <p className="text-xs text-muted-foreground">(optional) Highlight on homepage flash deals section</p>
              </div>
              <Switch checked={form.isFlashDeal} onCheckedChange={(v) => update("isFlashDeal", v)} />
            </div>
          </div>
        </section>

        <Separator />

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => router.push("/supplier/products")}>
            Cancel
          </Button>
          <Button type="submit" size="lg" disabled={loading || uploading} className="bg-brand text-brand-foreground hover:bg-brand/90">
            {loading ? (
              <>
                <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Submitting...
              </>
            ) : (
              <>
                <Icon name="bolt" size={16} className="mr-2 invert" />
                Submit for Admin Approval
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
