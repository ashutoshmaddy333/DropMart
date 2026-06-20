"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  onClick?: () => void;
}

export function MagneticButton({
  children,
  className,
  strength = 0.3,
  onClick,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);

  function handleMouse(e: React.MouseEvent) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * strength;
    const dy = (e.clientY - cy) * strength;
    ref.current.style.transform = `translate(${dx}px, ${dy}px)`;
  }

  function handleLeave() {
    if (!ref.current) return;
    ref.current.style.transform = "translate(0, 0)";
  }

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={cn("relative inline-flex transition-transform duration-200", className)}
    >
      {children}
    </motion.button>
  );
}
