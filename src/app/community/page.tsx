"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Trophy, Star, MessageSquare, Crown, BadgeCheck, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface TopReviewer {
  _id: string;
  name: string;
  image?: string;
  role: string;
  reviews: number;
  helpful: number;
}

interface Activity {
  _id: string;
  user: string;
  userImage?: string;
  action: string;
  target: string;
  targetId?: string;
  time: string;
}

interface Discussion {
  _id: string;
  title: string;
  category: string;
  authorId: {
    _id: string;
    name: string;
    image?: string;
  };
  upvotes: number;
  downvotes: number;
  score: number;
  commentCount: number;
  createdAt: string;
}

interface CommunityData {
  stats: {
    totalReviewers: number;
    reviewsThisMonth: number;
    superReviewers: number;
    avgRating: number;
  };
  topReviewers: TopReviewer[];
  recentActivity: Activity[];
}

const roleConfig: Record<string, { icon: any; color: string; bgColor: string; label: string }> = {
  admin: { icon: Shield, color: "text-red-600", bgColor: "bg-red-500/10", label: "Admin" },
  moderator: { icon: Shield, color: "text-orange-500", bgColor: "bg-orange-500/10", label: "Moderator" },
  super_reviewer: { icon: Crown, color: "text-purple-500", bgColor: "bg-purple-500/10", label: "Super Reviewer" },
  verified_reviewer: { icon: BadgeCheck, color: "text-blue-500", bgColor: "bg-blue-500/10", label: "Verified Reviewer" },
  user: { icon: Star, color: "text-muted-foreground", bgColor: "bg-muted", label: "Reviewer" },
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export default function CommunityPage() {
  const [data, setData] = useState<CommunityData | null>(null);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [discussionsLoading, setDiscussionsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/community");
        const json = await res.json();
        if (res.ok) {
          setData(json);
        }
      } catch (error) {
        console.error("Error fetching community data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchDiscussions() {
      try {
        const res = await fetch("/api/discussions?limit=5&sort=hot");
        const json = await res.json();
        if (res.ok) {
          setDiscussions(json.discussions || []);
        }
      } catch (error) {
        console.error("Error fetching discussions:", error);
      } finally {
        setDiscussionsLoading(false);
      }
    }
    fetchDiscussions();
  }, []);

  const stats = [
    { label: "Total Reviewers", value: data?.stats.totalReviewers ?? 0, icon: Users },
    { label: "Reviews This Month", value: data?.stats.reviewsThisMonth ?? 0, icon: MessageSquare },
    { label: "Super Reviewers", value: data?.stats.superReviewers ?? 0, icon: Crown },
    { label: "Avg. Rating", value: data?.stats.avgRating ?? 0, icon: Star, suffix: "★" },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="border-b border-border bg-gradient-to-b from-primary/5 to-background">
        <div className="container py-8 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto px-2"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 sm:px-4 sm:py-2 text-primary mb-4 sm:mb-6">
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="font-medium text-sm sm:text-base">Community Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Join Our Reviewer Community</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Connect with fellow reviewers, climb the leaderboards, and unlock exclusive
              badges through quality contributions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="container py-6 sm:py-8 px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mb-1.5 sm:mb-2" />
                  {loading ? (
                    <Skeleton className="h-7 sm:h-8 w-16 sm:w-20 mb-1" />
                  ) : (
                    <p className="text-xl sm:text-2xl font-bold">
                      {stat.suffix ? `${stat.value}${stat.suffix}` : formatNumber(stat.value)}
                    </p>
                  )}
                  <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Main Content */}
      <section className="container py-6 sm:py-8 px-4 sm:px-6">
        <Tabs defaultValue="leaderboard" className="space-y-6 sm:space-y-8">
          <TabsList className="grid w-full sm:w-auto sm:min-w-[420px] sm:mx-auto grid-cols-3">
            <TabsTrigger value="leaderboard">
              <Trophy className="hidden sm:block" />
              <span className="hidden sm:inline">Leaderboard</span>
              <span className="sm:hidden">Leaders</span>
            </TabsTrigger>
            <TabsTrigger value="discussions">
              <MessageSquare className="hidden sm:block" />
              <span className="hidden sm:inline">Discussions</span>
              <span className="sm:hidden">Discuss</span>
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Users className="hidden sm:block" />
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Top Reviewers */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      Top Reviewers
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    {loading ? (
                      [...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
                          <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded-full" />
                          <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-24 sm:w-32" />
                            <Skeleton className="h-3 w-36 sm:w-48" />
                          </div>
                        </div>
                      ))
                    ) : data?.topReviewers && data.topReviewers.length > 0 ? (
                      data.topReviewers.map((reviewer, index) => {
                        const role = roleConfig[reviewer.role] || roleConfig.user;
                        return (
                          <motion.div
                            key={reviewer._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                          >
                            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm ${
                              index === 0 ? "bg-yellow-400 text-yellow-900" :
                              index === 1 ? "bg-gray-300 text-gray-700" :
                              index === 2 ? "bg-orange-400 text-orange-900" :
                              "bg-muted text-muted-foreground"
                            }`}>
                              {index + 1}
                            </div>
                            <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                              <AvatarImage src={reviewer.image} />
                              <AvatarFallback>{reviewer.name?.[0] || "U"}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-sm sm:text-base truncate">{reviewer.name}</span>
                                <Badge variant="secondary" className={`${role.bgColor} ${role.color} border-0 text-[10px] sm:text-xs`}>
                                  <role.icon className="h-3 w-3 mr-1" />
                                  <span className="hidden sm:inline">{role.label}</span>
                                  <span className="sm:hidden">{role.label.split(' ')[0]}</span>
                                </Badge>
                              </div>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                {reviewer.reviews} reviews • {reviewer.helpful} helpful
                              </p>
                            </div>
                          </motion.div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No reviewers yet. Be the first!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Role Info */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Reviewer Tiers</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { role: "super_reviewer", desc: "Exclusive early access, editorial reviews", requirement: "100+ quality reviews" },
                      { role: "verified_reviewer", desc: "Highlighted badge, higher vote weight", requirement: "25+ helpful reviews" },
                      { role: "user", desc: "Basic reviews and upvotes", requirement: "Just sign up!" },
                    ].map((tier) => {
                      const role = roleConfig[tier.role] || roleConfig.user;
                      return (
                        <div key={tier.role} className="p-3 rounded-lg border border-border">
                          <div className="flex items-center gap-2 mb-1">
                            <role.icon className={`h-4 w-4 ${role.color}`} />
                            <span className="font-medium">{role.label}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{tier.desc}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Requirement: {tier.requirement}
                          </p>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="discussions" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Hot Discussions
                </CardTitle>
                <Link href="/community/discussions">
                  <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                    View All →
                  </Badge>
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {discussionsLoading ? (
                  [...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4">
                      <Skeleton className="h-10 w-10 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))
                ) : discussions.length > 0 ? (
                  discussions.map((discussion, index) => (
                    <motion.div
                      key={discussion._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={`/community/discussions/${discussion._id}`}
                        className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center min-w-[40px] text-center">
                          <span className={`text-lg font-bold ${discussion.score > 0 ? 'text-orange-500' : discussion.score < 0 ? 'text-blue-500' : 'text-muted-foreground'}`}>
                            {discussion.score}
                          </span>
                          <span className="text-xs text-muted-foreground">votes</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-xs">
                              {discussion.category.replace('_', ' ')}
                            </Badge>
                          </div>
                          <h3 className="font-medium text-foreground line-clamp-1 group-hover:text-primary">
                            {discussion.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Avatar className="h-4 w-4">
                                <AvatarImage src={discussion.authorId?.image} />
                                <AvatarFallback className="text-[8px]">
                                  {discussion.authorId?.name?.[0] || "U"}
                                </AvatarFallback>
                              </Avatar>
                              {discussion.authorId?.name}
                            </span>
                            <span>•</span>
                            <span>{discussion.commentCount} comments</span>
                            <span>•</span>
                            <span>{formatTimeAgo(discussion.createdAt)}</span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground mb-4">
                      No discussions yet. Be the first to start one!
                    </p>
                    <Link href="/community/discussions/new">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Start a Discussion
                      </motion.button>
                    </Link>
                  </div>
                )}
                {discussions.length > 0 && (
                  <div className="pt-2 text-center">
                    <Link href="/community/discussions">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium"
                      >
                        View all discussions →
                      </motion.button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-base sm:text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 sm:p-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded-full" />
                        <Skeleton className="h-4 w-40 sm:w-64" />
                      </div>
                      <Skeleton className="h-3 w-12 sm:w-16" />
                    </div>
                  ))
                ) : data?.recentActivity && data.recentActivity.length > 0 ? (
                  data.recentActivity.map((activity, index) => (
                    <motion.div
                      key={`${activity._id}-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start sm:items-center justify-between gap-2 p-3 sm:p-4 rounded-lg border border-border"
                    >
                      <div className="flex items-start sm:items-center gap-2 sm:gap-3 min-w-0">
                        <Avatar className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0">
                          <AvatarImage src={activity.userImage} />
                          <AvatarFallback>{activity.user?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm">
                            <span className="font-medium">{activity.user}</span>{" "}
                            <span className="text-muted-foreground">{activity.action}</span>{" "}
                            {activity.targetId ? (
                              <Link
                                href={`/apps/${activity.targetId}`}
                                className="font-medium text-primary hover:underline truncate"
                              >
                                {activity.target}
                              </Link>
                            ) : (
                              <span className="font-medium text-primary truncate">{activity.target}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] sm:text-xs text-muted-foreground flex-shrink-0">
                        {formatTimeAgo(activity.time)}
                      </span>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-6 sm:py-8 text-muted-foreground">
                    <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No recent activity yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
