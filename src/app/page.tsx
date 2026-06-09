"use client";

import { useEffect, useState } from "react";
import { Sparkles, TrendingUp, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AppCard } from "@/components/apps/AppCard";
import { Hero } from "@/components/hero/Hero";

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
      <Hero stats={stats} />

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
