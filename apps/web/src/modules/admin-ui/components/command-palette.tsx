"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { ADMIN_NAV } from "@/lib/constants";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setOpen((o) => !o);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  function navigate(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages, actions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {ADMIN_NAV.map((item) => (
            <CommandItem key={item.href} onSelect={() => navigate(item.href)}>
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => navigate("/admin/orders")}>
            View Pending Orders
          </CommandItem>
          <CommandItem onSelect={() => navigate("/admin/products")}>
            Add New Product
          </CommandItem>
          <CommandItem onSelect={() => navigate("/admin/rbac")}>
            Manage Permissions
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Storefront">
          <CommandItem onSelect={() => navigate("/")}>
            Go to Storefront
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
