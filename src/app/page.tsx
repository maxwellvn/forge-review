"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Clock, Flame } from "lucide-react";
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
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="container relative py-12 sm:py-20 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs sm:text-sm font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Community-Powered Reviews
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight lg:text-6xl mb-4 sm:mb-6">
              Discover & Review{" "}
              <span className="text-primary">Digital Products</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-2xl">
              Join our tiered reviewer community. Share insights, discover amazing apps, 
              and help others make informed decisions about digital products.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
              <Link href="/apps/upload" className="w-full sm:w-auto">
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  <Flame className="h-4 w-4" />
                  Submit Your App
                </Button>
              </Link>
              <Link href="#apps" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Explore Apps
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Bento Grid Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-10 sm:mt-16">
            {[
              { label: "Total Apps", value: stats?.totalApps ?? 0 },
              { label: "Active Reviewers", value: stats?.totalReviewers ?? 0 },
              { label: "Total Reviews", value: stats?.totalReviews ?? 0 },
              { label: "Total Views", value: stats?.totalViews ?? 0 },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="p-3 sm:p-4 rounded-xl border border-border bg-card"
              >
                <p className="text-xl sm:text-2xl font-bold">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
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
