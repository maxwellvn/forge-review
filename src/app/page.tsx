"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Clock, Flame, ArrowRight, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AppCard } from "@/components/apps/AppCard";
import Link from "next/link";

interface App {
  _id: string;
  title: string;
  shortDescription: string;
  iconUrl?: string;
  category: string;
  averageRating: number;
  totalReviews: number;
  isVerified: boolean;
  pulseScore: number;
  submissionType: string;
  uploader: {
    _id: string;
    name: string;
    image?: string;
  };
  tags: string[];
}

interface Stats {
  totalApps: number;
  verifiedApps: number;
  totalReviewers: number;
  totalReviews: number;
  totalViews: number;
}

export default function Home() {
  const [apps, setApps] = useState<App[]>([]);
  const [trendingApps, setTrendingApps] = useState<App[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("discover");

  useEffect(() => {
    fetchApps();
    fetchTrending();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      if (res.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchApps = async () => {
    try {
      const res = await fetch("/api/apps?limit=12");
      const data = await res.json();
      setApps(data.apps || []);
    } catch (error) {
      console.error("Error fetching apps:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrending = async () => {
    try {
      const res = await fetch("/api/apps?trending=true&limit=6");
      const data = await res.json();
      setTrendingApps(data.apps || []);
    } catch (error) {
      console.error("Error fetching trending:", error);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Layered premium background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          {/* dotted grid, faded toward the edges */}
          <div className="absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_75%_60%_at_50%_0%,#000_40%,transparent_100%)]" />
          {/* soft monochrome glow */}
          <div className="absolute left-1/2 -top-32 h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-foreground/[0.04] blur-[120px]" />
          {/* fade base to background */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        </div>

        <div className="container relative py-14 sm:py-24 lg:py-36">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-2 mb-5 sm:mb-7">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-foreground/80 shadow-sm backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-foreground/60" />
                Community-Powered Reviews
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tighter mb-5 sm:mb-7">
              <span className="bg-gradient-to-br from-foreground to-foreground/55 bg-clip-text text-transparent">
                Discover &amp; Review
              </span>
              <br className="hidden sm:block" />{" "}
              <span className="text-foreground/40">Digital Products</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-7 sm:mb-9 max-w-2xl leading-relaxed">
              Join our tiered reviewer community. Share insights, discover amazing apps,
              and help others make informed decisions about digital products.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
              <Link href="/apps/upload" className="w-full sm:w-auto">
                <Button size="lg" className="group gap-2 w-full sm:w-auto h-12 px-7 text-base shadow-sm">
                  <Flame className="h-4 w-4" />
                  Submit Your App
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
              <Link href="#apps" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-7 text-base bg-card/60 backdrop-blur-sm">
                  Explore Apps
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-12 sm:mt-20 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
          >
            {[
              { label: "Total Apps", value: stats?.totalApps ?? 0, icon: Flame },
              { label: "Active Reviewers", value: stats?.totalReviewers ?? 0, icon: Users },
              { label: "Total Reviews", value: stats?.totalReviews ?? 0, icon: Star },
              { label: "Total Views", value: stats?.totalViews ?? 0, icon: TrendingUp },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="group relative rounded-2xl border border-border bg-card/60 p-4 sm:p-5 backdrop-blur-sm transition-all hover:border-foreground/20 hover:shadow-md hover:shadow-black/5"
                >
                  <Icon className="h-4 w-4 text-muted-foreground/70 mb-2.5 transition-colors group-hover:text-foreground/70" />
                  <p className="text-2xl sm:text-3xl font-bold tracking-tight tabular-nums">
                    {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
                  </p>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Apps Section */}
      <section id="apps" className="py-8 sm:py-16">
        <div className="container">
          <Tabs defaultValue="discover" className="space-y-6 sm:space-y-8">
            <TabsList className="grid w-full sm:w-auto sm:min-w-[400px] grid-cols-3">
              <TabsTrigger value="discover">
                <Sparkles className="hidden sm:block" />
                Discover
              </TabsTrigger>
              <TabsTrigger value="trending">
                <TrendingUp className="hidden sm:block" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="recent">
                <Clock className="hidden sm:block" />
                Recent
              </TabsTrigger>
            </TabsList>

            <TabsContent value="discover" className="space-y-4">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-[260px] sm:h-[280px]" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {apps.map((app, index) => (
                    <AppCard key={app._id} app={app} index={index} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="trending" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {trendingApps.map((app, index) => (
                  <AppCard key={app._id} app={app} index={index} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recent" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {apps.slice(0, 8).map((app, index) => (
                  <AppCard key={app._id} app={app} index={index} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
