import type { Metadata } from "next";
import Link from "next/link";
import { ScrollReveal, StaggerGrid, StaggerItem } from "@/modules/storefront-ui/animations/scroll-reveal";

export const metadata: Metadata = { title: "Blog" };

const POSTS = [
  {
    slug: "best-air-fryers-under-3000",
    title: "Best Air Fryers Under ₹3,000 in India (2026 Guide)",
    excerpt: "We tested 8 popular air fryers and found the top picks for Indian kitchens.",
    category: "Kitchen",
    date: "Jun 1, 2026",
    readTime: "5 min",
  },
  {
    slug: "yoga-mat-buying-guide",
    title: "Yoga Mat Buying Guide: TPE vs PVC vs Rubber",
    excerpt: "Everything you need to know before buying your first yoga mat.",
    category: "Fitness",
    date: "May 28, 2026",
    readTime: "4 min",
  },
  {
    slug: "wireless-headphones-comparison",
    title: "Wireless Headphones Under ₹3,000: Complete Comparison",
    excerpt: "ANC, battery life, comfort — we compare the best budget headphones.",
    category: "Electronics",
    date: "May 20, 2026",
    readTime: "7 min",
  },
  {
    slug: "vitamin-c-serum-benefits",
    title: "Why Vitamin C Serum Should Be in Your Skincare Routine",
    excerpt: "Science-backed benefits of Vitamin C for Indian skin types.",
    category: "Beauty",
    date: "May 15, 2026",
    readTime: "3 min",
  },
];

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <ScrollReveal>
        <h1 className="text-4xl font-bold tracking-tight">DropMart Blog</h1>
        <p className="mt-2 text-muted-foreground">Buying guides, tips, and product reviews</p>
      </ScrollReveal>
      <StaggerGrid className="mt-10 space-y-4">
        {POSTS.map((post) => (
          <StaggerItem key={post.slug}>
            <article className="group rounded-xl border bg-card p-6 transition-shadow hover:shadow-md">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">{post.category}</span>
                <span>{post.date}</span>
                <span>· {post.readTime} read</span>
              </div>
              <h2 className="mt-3 text-xl font-semibold group-hover:text-emerald-600">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <p className="mt-2 text-muted-foreground">{post.excerpt}</p>
              <Link href={`/blog/${post.slug}`} className="mt-3 inline-block text-sm text-emerald-600 hover:underline">
                Read more →
              </Link>
            </article>
          </StaggerItem>
        ))}
      </StaggerGrid>
    </div>
  );
}
