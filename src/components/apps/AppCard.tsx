"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Download, TrendingUp, ExternalLink, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AppCardProps {
  app: {
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
  };
  index?: number;
}

export function AppCard({ app, index = 0 }: AppCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -4 }}
    >
      <Link href={`/apps/${app._id}`}>
        <Card className="group h-full overflow-hidden border-border bg-card hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer">
          <CardHeader className="p-3 sm:p-4 pb-0">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center text-xl sm:text-2xl font-bold overflow-hidden border border-border"
                >
                  {app.iconUrl ? (
                    <img
                      src={app.iconUrl}
                      alt={app.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    app.title[0]?.toUpperCase()
                  )}
                </motion.div>
                {app.isVerified && (
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 bg-background rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-base sm:text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
                    {app.title}
                  </h3>
                  {app.pulseScore > 100 && (
                    <Badge variant="secondary" className="text-xs gap-1 shrink-0">
                      <TrendingUp className="h-3 w-3" />
                      Hot
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {app.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {app.submissionType === "package" ? (
                      <Download className="h-3 w-3 inline mr-1" />
                    ) : (
                      <ExternalLink className="h-3 w-3 inline mr-1" />
                    )}
                    {app.submissionType}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-3 sm:p-4 pt-2.5 sm:pt-3">
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2.5 sm:mb-3">
              {app.shortDescription}
            </p>

            <div className="flex items-center justify-between mb-2.5 sm:mb-3">
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-sm">{app.averageRating.toFixed(1)}</span>
                <span className="text-[10px] sm:text-xs text-muted-foreground">
                  ({app.totalReviews})
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
                  <AvatarImage src={app.uploader.image} />
                  <AvatarFallback className="text-[10px] sm:text-xs">{app.uploader.name[0]}</AvatarFallback>
                </Avatar>
                <span className="text-[10px] sm:text-xs text-muted-foreground truncate max-w-[60px] sm:max-w-[80px]">
                  {app.uploader.name}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              {app.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs font-normal"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}