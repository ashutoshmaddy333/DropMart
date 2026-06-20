"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useMounted } from "@/hooks/use-mounted";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const mounted = useMounted();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={mounted ? { opacity: 0, y: 12 } : false}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
