"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/shared/icon";
import { TiltCard } from "@/modules/storefront-ui/animations/tilt-card";
import { AddToCartButton } from "@/components/storefront/cart/add-to-cart-button";
import type { Product } from "@/modules/products/types";
import { formatCurrency, calculateDiscount } from "@/lib/format";

interface ProductCardProps {
  product: Product;
  className?: string;
  priority?: boolean;
}

export function ProductCard({ product, className, priority }: ProductCardProps) {
  const discount = calculateDiscount(product.mrp, product.price);
  const defaultVariant = product.variants.find((v) => v.inStock)?.value;

  return (
    <TiltCard className={className} tiltMax={8} scale={1.03}>
      <Card className="group flex h-full flex-col overflow-hidden border-border/60 bg-card transition-all hover:border-brand/30 hover:shadow-glow">
        <Link href={`/products/${product.slug}`} className="block">
          <div className="relative aspect-square overflow-hidden bg-muted">
            <motion.div
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-full w-full"
            >
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                priority={priority}
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </motion.div>
            <div className="absolute left-3 top-3 flex flex-col gap-1.5">
              {product.isFlashDeal && (
                <Badge className="bg-red-600 text-white shadow-lg shadow-red-600/30 hover:bg-red-600">
                  ⚡ Flash Deal
                </Badge>
              )}
              {discount > 0 && (
                <Badge variant="secondary" className="bg-white/90 text-foreground backdrop-blur-sm">
                  {discount}% OFF
                </Badge>
              )}
            </div>
            <motion.button
              type="button"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              className="absolute right-3 top-3 rounded-full bg-white/90 p-2 opacity-0 shadow-lg backdrop-blur-sm transition-opacity group-hover:opacity-100"
              aria-label="Add to wishlist"
              onClick={(e) => e.preventDefault()}
            >
              <Icon name="heart" size={18} />
            </motion.button>
          </div>
        </Link>
        <CardContent className="flex flex-1 flex-col space-y-2 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {product.category}
          </p>
          <Link href={`/products/${product.slug}`}>
            <h3 className="line-clamp-2 font-medium leading-snug transition-colors group-hover:text-brand">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center gap-1.5">
            <Icon name="star" size={14} className="text-amber-500 dark:invert-0" />
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-sm text-muted-foreground">
              ({product.reviewCount.toLocaleString("en-IN")})
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold">{formatCurrency(product.price)}</span>
            {product.mrp > product.price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatCurrency(product.mrp)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Icon name="map-pin" size={12} />
            <span>
              Ships from {product.warehouseCity} · {product.deliveryDays} days
            </span>
          </div>
          <div className="mt-auto flex gap-2 pt-2">
            <div className="flex-1" onClick={(e) => e.preventDefault()}>
              <AddToCartButton
                product={product}
                variant={defaultVariant}
                size="sm"
                fullWidth
                className="w-full"
              />
            </div>
            <Button size="sm" variant="outline" asChild className="px-3">
              <Link href={`/products/${product.slug}`}>View</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </TiltCard>
  );
}
