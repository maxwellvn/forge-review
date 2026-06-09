"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import {
  Sparkles,
  Flame,
  ArrowRight,
  Star,
  Users,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Stats {
  totalApps: number;
  verifiedApps: number;
  totalReviewers: number;
  totalReviews: number;
  totalViews: number;
}

const compact = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

// Word-clip reveal: each word rises from beneath its overflow-hidden parent.
const lineContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const word: Variants = {
  hidden: { y: "105%" },
  show: { y: "0%", transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

function Word({ children }: { children: string }) {
  return (
    <span className="inline-block overflow-hidden align-bottom">
      <motion.span variants={word} className="inline-block">
        {children}
      </motion.span>
    </span>
  );
}

/** Primary CTA that magnetically follows the cursor. */
function MagneticButton({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 18, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 200, damping: 18, mass: 0.5 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - (rect.left + rect.width / 2)) * 0.28);
    y.set((e.clientY - (rect.top + rect.height / 2)) * 0.28);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ x: springX, y: springY }}
      whileHover={{ scale: 1.03 }}
      className="w-full sm:w-auto"
    >
      {children}
    </motion.div>
  );
}

export function Hero({ stats }: { stats: Stats | null }) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Scroll parallax: content drifts up and fades, stats pull away faster, blobs lag.
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const contentOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.06]);
  const statsY = useTransform(scrollYProgress, [0, 0.65], [0, 45]);
  const statsOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const gridY = useTransform(scrollYProgress, [0, 1], [0, -60]);

  const statItems: { label: string; value: number; icon: LucideIcon }[] = [
    { label: "Total Apps", value: stats?.totalApps ?? 0, icon: Flame },
    { label: "Active Reviewers", value: stats?.totalReviewers ?? 0, icon: Users },
    { label: "Total Reviews", value: stats?.totalReviews ?? 0, icon: Star },
    { label: "Total Views", value: stats?.totalViews ?? 0, icon: TrendingUp },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-b border-border"
    >
      {/* Layered ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* dotted grid, faded toward the edges */}
        <motion.div
          style={{ y: gridY }}
          className="absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_78%_58%_at_50%_0%,#000_35%,transparent_100%)]"
        />
      </div>

      {/* fade base into the page background */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-b from-transparent to-background" />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="container relative flex flex-col items-center py-16 text-center sm:py-24 lg:py-32"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="mb-7 inline-flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-4 py-1.5 text-xs font-medium text-foreground/70 shadow-sm backdrop-blur-sm"
        >
          <Sparkles className="h-3 w-3 text-muted-foreground" />
          Community-Powered Reviews
        </motion.div>

        {/* Headline with word-clip reveal */}
        <motion.h1
          variants={lineContainer}
          initial="hidden"
          animate="show"
          className="mb-6 max-w-4xl text-5xl font-extrabold leading-[1.0] tracking-tighter sm:text-7xl lg:text-[88px]"
        >
          <span className="flex flex-wrap justify-center gap-x-[0.22em]">
            <span className="bg-gradient-to-br from-foreground to-foreground/40 bg-clip-text text-transparent">
              <Word>Discover</Word>
            </span>
            <span className="bg-gradient-to-br from-foreground to-foreground/40 bg-clip-text text-transparent">
              <Word>&amp;</Word>
            </span>
            <span className="bg-gradient-to-br from-foreground to-foreground/40 bg-clip-text text-transparent">
              <Word>Review</Word>
            </span>
          </span>
          <span className="flex flex-wrap justify-center gap-x-[0.22em] text-foreground/20">
            <Word>Digital</Word>
            <Word>Products</Word>
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.5, ease: "easeOut" }}
          className="mb-9 max-w-lg text-base leading-relaxed text-muted-foreground"
        >
          Join our tiered reviewer community. Share insights, discover amazing apps,
          and help others make informed decisions about digital products.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.65, ease: "easeOut" }}
          className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row"
        >
          <MagneticButton>
            <Link href="/apps/upload" className="block w-full sm:w-auto">
              <Button size="lg" className="group h-12 w-full gap-2 px-7 text-base shadow-sm sm:w-auto">
                <Flame className="h-4 w-4" />
                Submit Your App
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
          </MagneticButton>
          <Link href="#apps" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="h-12 w-full px-7 text-base bg-card/60 backdrop-blur-sm sm:w-auto"
            >
              Explore Apps
            </Button>
          </Link>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.85, ease: "easeInOut" }}
          className="my-8 h-px w-12 origin-center bg-border"
        />

        {/* Stats */}
        <motion.div
          style={{ y: statsY, opacity: statsOpacity }}
          className="grid w-full max-w-3xl grid-cols-2 gap-3 md:grid-cols-4"
        >
          {statItems.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.95 + i * 0.08, ease: "easeOut" }}
                className="group rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-lg hover:shadow-black/[0.06] sm:p-5"
              >
                <Icon className="mb-2.5 h-4 w-4 text-muted-foreground/70 transition-colors group-hover:text-foreground/70" />
                <p className="text-2xl font-bold tracking-tight tabular-nums sm:text-3xl">
                  {compact.format(stat.value)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{stat.label}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
}
