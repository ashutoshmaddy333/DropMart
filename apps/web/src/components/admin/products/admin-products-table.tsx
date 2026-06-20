"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PermissionGate } from "@/components/shared/permission-gate";
import { Permission } from "@/modules/rbac/permissions";
import { MOCK_PRODUCTS } from "@/modules/products/data/mock-products";
import { formatCurrency } from "@/lib/format";

export function AdminProductsTable() {
  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {MOCK_PRODUCTS.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 overflow-hidden rounded-lg border">
                    <Image
                      src={product.images[0]}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.brand}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{formatCurrency(product.price)}</p>
                  <p className="text-xs text-muted-foreground line-through">
                    {formatCurrency(product.mrp)}
                  </p>
                </div>
              </TableCell>
              <TableCell>{product.stockCount}</TableCell>
              <TableCell>★ {product.rating}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {product.isFeatured && <Badge variant="secondary">Featured</Badge>}
                  {product.isFlashDeal && (
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Flash</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <PermissionGate require={Permission.ProductUpdate}>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </PermissionGate>
                <PermissionGate require={Permission.ProductDelete}>
                  <Button variant="ghost" size="sm" className="text-destructive">
                    Delete
                  </Button>
                </PermissionGate>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
