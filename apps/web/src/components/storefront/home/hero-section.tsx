import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";
import { TRUST_BADGES } from "@/lib/constants";

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="absolute inset-0 opacity-30">
        <Image
          src="/images/hero/banner.jpg"
          alt="Hero banner"
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="relative mx-auto grid max-w-7xl gap-8 px-6 py-16 md:grid-cols-2 md:py-24">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm backdrop-blur">
            <Icon name="bolt" size={14} className="invert" />
            Flash Sale — Up to 60% Off
          </span>
          <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
            Shop Smart.
            <br />
            <span className="text-emerald-400">Delivered Fast.</span>
          </h1>
          <p className="max-w-md text-lg text-slate-300">
            Geo-boosted delivery from nearby warehouses. Premium products at dropship prices across India.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" asChild className="bg-emerald-600 hover:bg-emerald-700">
              <Link href="/products">Shop Now</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10">
              <Link href="/products?deals=flash">Flash Deals</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TrustBadges() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {TRUST_BADGES.map((badge) => (
        <div
          key={badge.title}
          className="flex items-start gap-4 rounded-xl border bg-card p-5 transition-shadow hover:shadow-md"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/5">
            <Icon name={badge.icon} size={22} />
          </div>
          <div>
            <h3 className="font-semibold">{badge.title}</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">{badge.desc}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

export function CategoryGrid({
  categories,
}: {
  categories: readonly { name: string; slug: string; image: string }[];
}) {
  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Shop by Category</h2>
          <p className="text-muted-foreground">Curated collections for every need</p>
        </div>
        <Button variant="ghost" asChild>
          <Link href="/products">View All →</Link>
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/categories/${cat.slug}`}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl"
          >
            <Image
              src={cat.image}
              alt={cat.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 p-5">
              <h3 className="text-lg font-bold text-white">{cat.name}</h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
