import Image from "next/image";
import { cn } from "@/lib/utils";

export type IconName =
  | "shopping-cart"
  | "heart"
  | "user"
  | "search"
  | "truck"
  | "shield-check"
  | "returns"
  | "star"
  | "map-pin"
  | "credit-card"
  | "bell"
  | "chart-bar"
  | "cube"
  | "users"
  | "settings"
  | "lock"
  | "bolt"
  | "shopping-bag-solid"
  | "razorpay"
  | "stripe"
  | "instagram"
  | "whatsapp"
  | "phone"
  | "mail";

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  alt?: string;
}

const SVG_ICONS: IconName[] = [
  "shopping-cart",
  "heart",
  "user",
  "search",
  "truck",
  "shield-check",
  "returns",
  "star",
  "map-pin",
  "credit-card",
  "bell",
  "chart-bar",
  "cube",
  "users",
  "settings",
  "lock",
  "bolt",
  "shopping-bag-solid",
  "instagram",
  "whatsapp",
  "phone",
  "mail",
];

const BRAND_ICONS: IconName[] = ["instagram", "whatsapp"];

export function Icon({ name, size = 20, className, alt }: IconProps) {
  const isSvg = SVG_ICONS.includes(name);

  if (isSvg) {
    return (
      <Image
        src={`/icons/${name}.svg`}
        alt={alt ?? name}
        width={size}
        height={size}
        className={cn(
          "shrink-0",
          !BRAND_ICONS.includes(name) && "dark:invert",
          className,
        )}
      />
    );
  }

  return (
    <Image
      src={`/icons/${name}.png`}
      alt={alt ?? name}
      width={size}
      height={size}
      className={cn("shrink-0 object-contain", className)}
    />
  );
}
