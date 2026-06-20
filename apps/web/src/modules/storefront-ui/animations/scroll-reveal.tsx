"use client";

import { motion, type HTMLMotionProps, type Variants } from "framer-motion";
import { useMounted } from "@/hooks/use-mounted";

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -28 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] } },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 28 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] } },
};

interface ScrollRevealProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "scale";
}

const directionVariants: Record<string, Variants> = {
  up: fadeInUp,
  down: { hidden: { opacity: 0, y: -40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } },
  left: slideInLeft,
  right: slideInRight,
  scale: scaleIn,
};

export function ScrollReveal({
  children,
  delay = 0,
  direction = "up",
  className,
  ...props
}: ScrollRevealProps) {
  const mounted = useMounted();

  return (
    <motion.div
      initial={mounted ? "hidden" : false}
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={directionVariants[direction]}
      transition={{ delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const mounted = useMounted();

  return (
    <motion.div
      initial={mounted ? "hidden" : false}
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={fadeInUp} className={className}>
      {children}
    </motion.div>
  );
}
