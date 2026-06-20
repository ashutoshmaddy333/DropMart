"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Icon } from "@/components/shared/icon";
import { ProductCard } from "@/components/storefront/product/product-card";
import { ProductGallery } from "@/components/storefront/product/product-gallery";
import { AddToCartButton } from "@/components/storefront/cart/add-to-cart-button";
import { useCartStore } from "@/modules/cart/store/cart-store";
import { ScrollReveal } from "@/modules/storefront-ui/animations/scroll-reveal";
import type { Product } from "@/modules/products/types";
import { formatCurrency, calculateDiscount } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ProductDetailViewProps {
  product: Product;
  relatedProducts: Product[];
}

const TRUST_ITEMS = [
  { icon: "truck" as const, title: "Fast Delivery", desc: "Free on ₹999+" },
  { icon: "returns" as const, title: "Easy Returns", desc: "7-day policy" },
  { icon: "shield-check" as const, title: "Secure Pay", desc: "Razorpay & Stripe" },
  { icon: "map-pin" as const, title: "Geo-Boosted", desc: "Nearest warehouse" },
];

export function ProductDetailView({ product, relatedProducts }: ProductDetailViewProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants.find((v) => v.inStock)?.value ?? product.variants[0]?.value
  );
  const [quantity, setQuantity] = useState(1);

  const discount = calculateDiscount(product.mrp, product.price);

  return (
    <>
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <ProductGallery
          images={product.images}
          name={product.name}
          isFlashDeal={product.isFlashDeal}
          discount={discount}
        />

        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-brand/30 text-brand">
                {product.category}
              </Badge>
              <Badge variant="outline">{product.brand}</Badge>
              {product.inStock ? (
                <Badge className="bg-brand/10 text-brand hover:bg-brand/10">
                  ● In Stock ({product.stockCount})
                </Badge>
              ) : (
                <Badge variant="destructive">Out of Stock</Badge>
              )}
            </div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">
              {product.name}
            </h1>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              {product.shortDescription}
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Icon
                  key={i}
                  name="star"
                  size={16}
                  className={cn(
                    i < Math.floor(product.rating) ? "text-amber-500" : "text-muted-foreground/30"
                  )}
                />
              ))}
            </div>
            <span className="font-semibold">{product.rating}</span>
            <span className="text-muted-foreground">
              ({product.reviewCount.toLocaleString("en-IN")} reviews)
            </span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-brand/20 bg-gradient-to-br from-brand/5 to-transparent p-5"
          >
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-4xl font-extrabold tracking-tight">
                {formatCurrency(product.price)}
              </span>
              {product.mrp > product.price && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    {formatCurrency(product.mrp)}
                  </span>
                  <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/10">
                    Save {formatCurrency(product.mrp - product.price)}
                  </Badge>
                </>
              )}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Inclusive of all taxes</p>
          </motion.div>

          <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/40 p-4 text-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10">
              <Icon name="map-pin" size={18} className="text-brand" />
            </div>
            <div>
              <p className="font-medium">Ships from {product.warehouseCity}</p>
              <p className="text-muted-foreground">
                Estimated delivery in <strong>{product.deliveryDays} days</strong> via nearest
                warehouse
              </p>
            </div>
          </div>

          {product.variants.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold">
                {product.variants[0].label}
                <span className="ml-2 font-normal text-muted-foreground">{selectedVariant}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <Button
                    key={v.id}
                    variant={selectedVariant === v.value ? "default" : "outline"}
                    size="sm"
                    disabled={!v.inStock}
                    onClick={() => setSelectedVariant(v.value)}
                    className={cn(
                      selectedVariant === v.value && "bg-brand text-brand-foreground hover:bg-brand/90"
                    )}
                  >
                    {v.value}
                    {!v.inStock && " (OOS)"}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center rounded-xl border border-border/60 bg-card shadow-sm">
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 rounded-l-xl"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                −
              </Button>
              <span className="w-12 text-center text-lg font-semibold">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 rounded-r-xl"
                onClick={() => setQuantity(Math.min(product.stockCount, quantity + 1))}
              >
                +
              </Button>
            </div>
            <AddToCartButton
              product={product}
              quantity={quantity}
              variant={selectedVariant}
              size="lg"
              fullWidth
              openDrawer
              className="flex-1 h-11"
            />
            <Button
              size="lg"
              variant="outline"
              className="h-11 border-brand/30 hover:border-brand"
              onClick={() => {
                addItem(product, quantity, selectedVariant);
                router.push("/checkout");
              }}
            >
              Buy Now
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {TRUST_ITEMS.map((item) => (
              <div
                key={item.title}
                className="flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-card p-3 text-center"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10">
                  <Icon name={item.icon} size={18} className="text-brand" />
                </div>
                <div>
                  <p className="text-xs font-semibold">{item.title}</p>
                  <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Tabs defaultValue="description" className="mt-16 w-full">
        <TabsList className="h-auto w-full justify-start gap-1 rounded-xl bg-muted/50 p-1">
          {[
            { value: "description", label: "Description" },
            { value: "specs", label: "Specifications" },
            { value: "reviews", label: `Reviews (${product.reviewCount})` },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="description" className="mt-8 max-w-3xl">
          <div className="rounded-2xl border border-border/60 bg-card p-6">
            <p className="leading-relaxed text-muted-foreground">{product.description}</p>
            <ul className="mt-6 space-y-3">
              {product.features.map((f, i) => (
                <motion.li
                  key={f}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-3 text-sm"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs text-brand">
                    ✓
                  </span>
                  {f}
                </motion.li>
              ))}
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="specs" className="mt-8">
          <div className="rounded-2xl border border-border/60 bg-card p-6">
            <dl className="grid gap-0 sm:grid-cols-2">
              {Object.entries(product.specifications).map(([key, val], i) => (
                <div
                  key={key}
                  className={cn(
                    "flex justify-between border-b border-border/40 py-3 text-sm",
                    i % 2 === 0 && "sm:pr-6"
                  )}
                >
                  <dt className="text-muted-foreground">{key}</dt>
                  <dd className="font-medium">{val}</dd>
                </div>
              ))}
            </dl>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-8 space-y-4">
          {product.reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
              No reviews yet. Be the first to review!
            </div>
          ) : (
            product.reviews.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-border/60 bg-card p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand">
                      {review.author[0]}
                    </div>
                    <span className="font-medium">{review.author}</span>
                    {review.verified && (
                      <Badge variant="outline" className="text-xs text-brand">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: review.rating }).map((_, j) => (
                      <Icon key={j} name="star" size={12} className="text-amber-500" />
                    ))}
                  </div>
                </div>
                <h4 className="mt-3 font-semibold">{review.title}</h4>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{review.body}</p>
              </motion.div>
            ))
          )}
        </TabsContent>
      </Tabs>

      <Separator className="my-16" />

      {relatedProducts.length > 0 && (
        <ScrollReveal>
          <section>
            <h2 className="mb-2 text-2xl font-bold tracking-tight">You May Also Like</h2>
            <p className="mb-6 text-muted-foreground">More from {product.category}</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* Mobile sticky buy bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 p-4 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{product.name}</p>
            <p className="text-lg font-bold text-brand">{formatCurrency(product.price)}</p>
          </div>
          <AddToCartButton
            product={product}
            quantity={quantity}
            variant={selectedVariant}
            size="default"
            openDrawer
            label="Add"
            className="shrink-0 px-6"
          />
        </div>
      </div>
      <div className="h-20 lg:hidden" />
    </>
  );
}
