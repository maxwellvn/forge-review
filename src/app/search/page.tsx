"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, X, Filter, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AppCard } from "@/components/apps/AppCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { categories } = useCategories("app");
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "all";

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchResults = useCallback(async () => {
    if (!query.trim() && category === "all") {
      setApps([]);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("search", query.trim());
      if (category && category !== "all") params.set("category", category);
      params.set("limit", "24");

      const res = await fetch(`/api/apps?${params.toString()}`);
      const data = await res.json();
      setApps(data.apps || []);
    } catch (error) {
      console.error("Error searching apps:", error);
    } finally {
      setLoading(false);
    }
  }, [query, category]);

  useEffect(() => {
    if (initialQuery) {
      fetchResults();
    }
  }, [initialQuery]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (category && category !== "all") params.set("category", category);
    router.push(`/search?${params.toString()}`);
    fetchResults();
  };

  const clearSearch = () => {
    setQuery("");
    setCategory("all");
    setApps([]);
    setHasSearched(false);
    router.push("/search");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-6 sm:py-12">
      <div className="container max-w-6xl px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">Search Apps</h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto px-4 sm:px-0">
            Find apps, tools, and digital products by name, description, or tags
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 sm:mb-8"
        >
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search apps, tools, products..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pl-10 text-sm sm:text-base"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                </div>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full sm:w-[180px] text-sm">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleSearch} className="gap-2 w-full sm:w-auto">
                  <Search className="h-4 w-4" />
                  <span className="sm:inline">Search</span>
                </Button>
              </div>

              {/* Active Filters */}
              {(query || category !== "all") && (
                <div className="flex flex-wrap items-center gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
                  <span className="text-xs sm:text-sm text-muted-foreground">Active filters:</span>
                  {query && (
                    <Badge variant="secondary" className="gap-1 text-xs">
                      Query: <span className="truncate max-w-[100px] sm:max-w-[150px]">{query}</span>
                      <button onClick={() => setQuery("")} className="min-h-[20px] min-w-[20px] flex items-center justify-center">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {category !== "all" && (
                    <Badge variant="secondary" className="gap-1 text-xs">
                      Category: {category}
                      <button onClick={() => setCategory("all")} className="min-h-[20px] min-w-[20px] flex items-center justify-center">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  <button
                    onClick={clearSearch}
                    className="text-xs sm:text-sm text-muted-foreground hover:text-foreground ml-auto"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-[260px] sm:h-[280px]" />
              ))}
            </div>
          ) : hasSearched ? (
            <>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <p className="text-sm sm:text-base text-muted-foreground">
                  Found <span className="font-medium text-foreground">{apps.length}</span> results
                  {query && (
                    <span>
                      {" "}
                      for "<span className="font-medium truncate">{query}</span>"
                    </span>
                  )}
                </p>
              </div>

              {apps.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {apps.map((app, index) => (
                    <AppCard key={app._id} app={app} index={index} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 sm:py-16">
                  <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-muted mb-4">
                    <Search className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-base sm:text-lg font-medium mb-2">No results found</h3>
                  <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto mb-6 px-4 sm:px-0">
                    We couldn't find any apps matching your search. Try adjusting your
                    filters or search terms.
                  </p>
                  <Button variant="outline" onClick={clearSearch}>
                    Clear Search
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 sm:py-16">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 mb-4">
                <SlidersHorizontal className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-medium mb-2">Start Searching</h3>
              <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto px-4 sm:px-0">
                Enter a search term above to discover apps, tools, and digital products
                in our community.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
        <div className="container max-w-6xl">
          <div className="text-center mb-8">
            <Skeleton className="h-10 w-48 mx-auto mb-3" />
            <Skeleton className="h-5 w-96 mx-auto" />
          </div>
          <Skeleton className="h-32 w-full mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-[280px]" />
            ))}
          </div>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
