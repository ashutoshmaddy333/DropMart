"use client";

import { usePathname } from "next/navigation";

/** Plain wrapper — AnimatePresence "wait" caused blank screens on mobile Safari. */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="min-h-0 w-full overflow-x-hidden">
      {children}
    </div>
  );
}
