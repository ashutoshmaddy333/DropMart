"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  name: string;
  isFlashDeal?: boolean;
  discount?: number;
}

export function ProductGallery({ images, name, isFlashDeal, discount }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);
  const [zoom, setZoom] = useState({ x: 50, y: 50, active: false });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setZoom({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      active: true,
    });
  };

  return (
    <div className="space-y-4">
      <div
        className="group relative aspect-square overflow-hidden rounded-2xl border border-border/60 bg-muted shadow-sm ring-1 ring-black/5 dark:ring-white/5"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setZoom((z) => ({ ...z, active: false }))}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={selected}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, scale: zoom.active ? 1.35 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative h-full w-full"
            style={{
              transformOrigin: `${zoom.x}% ${zoom.y}%`,
            }}
          >
            <Image
              src={images[selected]}
              alt={name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </motion.div>
        </AnimatePresence>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

        <div className="absolute left-4 top-4 flex flex-col gap-2">
          {isFlashDeal && (
            <Badge className="bg-red-600 text-white shadow-lg shadow-red-600/30">⚡ Flash Deal</Badge>
          )}
          {discount != null && discount > 0 && (
            <Badge className="bg-brand text-brand-foreground">{discount}% OFF</Badge>
          )}
        </div>

        <div className="absolute bottom-4 right-4 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {selected + 1} / {images.length}
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {images.map((img, i) => (
          <motion.button
            key={i}
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelected(i)}
            className={cn(
              "relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all",
              selected === i
                ? "border-brand ring-2 ring-brand/25 shadow-glow"
                : "border-border/60 opacity-70 hover:opacity-100"
            )}
          >
            <Image src={img} alt="" fill className="object-cover" sizes="80px" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
