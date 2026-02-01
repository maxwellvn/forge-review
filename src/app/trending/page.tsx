"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Flame, Award } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AppCard } from "@/components/apps/AppCard";
import { useCategories } from "@/hooks/useCategories";

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
    name: string;
    image?: string;
  };
  tags: string[];
}

export default function TrendingPage() {
  const { categories } = useCategories("app");
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    try {
      const res = await fetch("/api/apps?trending=true&limit=20");
      const data = await res.json();
      setApps(data.apps || []);
    } catch (error) {
      console.error("Error fetching trending apps:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="border-b border-border bg-gradient-to-b from-orange-500/10 to-background">
        <div className="container py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-4 py-2 text-orange-600 mb-6">
              <Flame className="h-5 w-5" />
              <span className="font-medium">Trending Now</span>
            </div>
            <h1 className="text-3xl font-bold mb-4">Most Popular Apps</h1>
            <p className="text-muted-foreground">
              Discover what the community is buzzing about. These apps are gaining traction 
              based on views, reviews, and engagement.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="container py-12">
        <Tabs defaultValue="all" className="space-y-8">
          <TabsList className={`grid w-full max-w-md mx-auto`} style={{ gridTemplateColumns: `repeat(${categories.length + 1}, minmax(0, 1fr))` }}>
            <TabsTrigger value="all">All</TabsTrigger>
            {categories.map((cat) => (
              <TabsTrigger key={cat._id} value={cat.slug}>
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="space-y-8">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-[280px]" />
                ))}
              </div>
            ) : (
              <>
                {/* Top 3 Featured */}
                {apps.slice(0, 3).length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {apps.slice(0, 3).map((app, index) => (
                      <motion.div
                        key={app._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative"
                      >
                        <div className="absolute -top-3 -left-3 z-10">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            index === 0 ? "bg-yellow-400 text-yellow-900" :
                            index === 1 ? "bg-gray-300 text-gray-700" :
                            "bg-orange-400 text-orange-900"
                          }`}>
                            #{index + 1}
                          </div>
                        </div>
                        <AppCard app={app} index={index} />
                      </motion.div>
                    ))}
                  </div>
                )}

                <div className="border-t border-border pt-8">
                  <h2 className="text-xl font-semibold mb-6">More Trending</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {apps.slice(3).map((app, index) => (
                      <AppCard key={app._id} app={app} index={index + 3} />
                    ))}
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {categories.map((cat) => (
            <TabsContent key={cat._id} value={cat.slug} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {apps
                  .filter((app) => app.category.toLowerCase() === cat.name.toLowerCase())
                  .map((app, index) => (
                    <AppCard key={app._id} app={app} index={index} />
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </section>
    </div>
  );
}