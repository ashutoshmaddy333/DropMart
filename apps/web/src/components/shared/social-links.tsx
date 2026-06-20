import Link from "next/link";
import { Icon } from "@/components/shared/icon";
import { CONTACT } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface SocialLinksProps {
  size?: number;
  className?: string;
  showLabels?: boolean;
}

export function SocialLinks({ size = 20, className, showLabels = false }: SocialLinksProps) {
  const links = [
    {
      name: "WhatsApp",
      icon: "whatsapp" as const,
      href: `https://wa.me/${CONTACT.whatsapp}`,
      color: "hover:bg-[#25D366]/10 hover:text-[#25D366]",
      iconClass: "text-[#25D366]",
    },
    {
      name: "Instagram",
      icon: "instagram" as const,
      href: CONTACT.instagram || undefined,
      color: "hover:bg-[#E4405F]/10 hover:text-[#E4405F]",
      iconClass: "text-[#E4405F]",
    },
  ];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {links.map((link) => {
        const content = (
          <>
            <Icon
              name={link.icon}
              size={size}
              className={cn(link.iconClass, "transition-transform group-hover:scale-110")}
            />
            {showLabels && <span className="text-sm font-medium">{link.name}</span>}
          </>
        );

        const baseClass = cn(
          "group inline-flex items-center gap-2 rounded-xl border border-border/60 bg-background/50 p-2.5 transition-all duration-200",
          link.color,
          !link.href && "cursor-default opacity-70",
        );

        if (!link.href) {
          return (
            <span key={link.name} className={baseClass} title={`${link.name} link coming soon`}>
              {content}
            </span>
          );
        }

        return (
          <Link
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={baseClass}
            aria-label={link.name}
          >
            {content}
          </Link>
        );
      })}
    </div>
  );
}
