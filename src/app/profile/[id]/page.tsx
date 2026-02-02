"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  User,
  MessageSquare,
  ThumbsUp,
  Award,
  Calendar,
  AppWindow,
  Star,
  ArrowLeft,
  Crown,
  BadgeCheck,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { StarRating } from "@/components/reviews/StarRating";

interface UserProfile {
  _id: string;
  name: string;
  image?: string;
  role: "user" | "verified_reviewer" | "super_reviewer" | "moderator" | "admin";
  bio?: string;
  reviewsCount: number;
  helpfulVotes: number;
  joinedAt: string;
  isVerified: boolean;
  badges: string[];
  appsCount: number;
  discussionsCount: number;
}

interface App {
  _id: string;
  title: string;
  shortDescription: string;
  iconUrl?: string;
  category: string;
  averageRating: number;
  totalReviews: number;
  createdAt: string;
}

interface Review {
  _id: string;
  content: string;
  rating: number;
  helpful: number;
  createdAt: string;
  appId: {
    _id: string;
    title: string;
    iconUrl?: string;
    category: string;
  };
}

interface Discussion {
  _id: string;
  title: string;
  category: string;
  score: number;
  commentCount: number;
  createdAt: string;
}

const roleConfig = {
  admin: {
    icon: Shield,
    color: "text-red-600",
    bgColor: "bg-red-600/10",
    borderColor: "border-red-600/20",
    label: "Administrator",
  },
  super_reviewer: {
    icon: Crown,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    label: "Super Reviewer",
  },
  verified_reviewer: {
    icon: BadgeCheck,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    label: "Verified Reviewer",
  },
  moderator: {
    icon: Shield,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
    label: "Moderator",
  },
  user: {
    icon: User,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    borderColor: "border-border",
    label: "Member",
  },
};

const categoryLabels: Record<string, string> = {
  general: "General",
  feedback: "Feedback",
  bug_report: "Bug Report",
  feature_request: "Feature Request",
  showcase: "Showcase",
  question: "Question",
};

export default function PublicProfilePage() {
  const params = useParams();
  const userId = params.id as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [apps, setApps] = useState<App[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        setApps(data.apps || []);
        setReviews(data.reviews || []);
        setDiscussions(data.discussions || []);
      } else {
        setError("User not found");
      }
    } catch (err) {
      setError("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-6 mb-8">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container py-12">
        <div className="max-w-4xl mx-auto text-center">
          <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The user you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const role = roleConfig[profile.role] || roleConfig.user;
  const RoleIcon = role.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-6 sm:py-12">
      <div className="container max-w-4xl px-4 sm:px-6">
        {/* Back button */}
        <Button variant="ghost" asChild className="mb-4 sm:mb-6">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-6">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 ring-4 ring-background shadow-lg">
              <AvatarImage src={profile.image} alt={profile.name} />
              <AvatarFallback className="text-2xl">
                {profile.name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold truncate">
                  {profile.name}
                </h1>
                <Badge
                  variant="secondary"
                  className={`${role.bgColor} ${role.color} ${role.borderColor} border`}
                >
                  <RoleIcon className="h-3 w-3 mr-1" />
                  {role.label}
                </Badge>
                {profile.isVerified && (
                  <Badge variant="outline" className="text-green-600 border-green-600/20">
                    <BadgeCheck className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              {profile.bio && (
                <p className="text-muted-foreground mb-2">{profile.bio}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Member since {formatDate(profile.joinedAt)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8"
        >
          {[
            { label: "Apps", value: profile.appsCount, icon: AppWindow },
            { label: "Reviews", value: profile.reviewsCount, icon: MessageSquare },
            { label: "Helpful", value: profile.helpfulVotes, icon: ThumbsUp },
            { label: "Discussions", value: profile.discussionsCount, icon: MessageSquare },
            { label: "Badges", value: profile.badges.length, icon: Award },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-3 sm:p-4 text-center">
                <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mx-auto mb-1.5 sm:mb-2" />
                <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="apps" className="space-y-6">
            <TabsList className="grid w-full sm:w-auto sm:min-w-[420px] grid-cols-3">
              <TabsTrigger value="apps">
                <AppWindow className="hidden sm:block" />
                Apps
                {apps.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {apps.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="reviews">
                <Star className="hidden sm:block" />
                Reviews
                {reviews.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {reviews.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="discussions">
                <MessageSquare className="hidden sm:block" />
                Discussions
                {discussions.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {discussions.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Apps Tab */}
            <TabsContent value="apps" className="space-y-4">
              {apps.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <AppWindow className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No apps submitted</h3>
                    <p className="text-muted-foreground">
                      This user hasn't submitted any apps yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {apps.map((app, index) => (
                    <motion.div
                      key={app._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link href={`/apps/${app._id}`}>
                        <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                                {app.iconUrl ? (
                                  <Image
                                    src={app.iconUrl}
                                    alt={app.title}
                                    width={56}
                                    height={56}
                                    className="object-cover"
                                  />
                                ) : (
                                  <AppWindow className="h-6 w-6 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold truncate">{app.title}</h3>
                                  <Badge variant="outline" className="text-xs flex-shrink-0">
                                    {app.category}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                  {app.shortDescription}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span>{app.averageRating.toFixed(1)}</span>
                                    <span>({app.totalReviews})</span>
                                  </div>
                                  <span>{formatDate(app.createdAt)}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="space-y-4">
              {reviews.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
                    <p className="text-muted-foreground">
                      This user hasn't written any reviews yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                reviews.map((review, index) => (
                  <motion.div
                    key={review._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <Link href={`/apps/${review.appId?._id}`}>
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={review.appId?.iconUrl} />
                              <AvatarFallback>
                                {review.appId?.title?.[0] || "A"}
                              </AvatarFallback>
                            </Avatar>
                          </Link>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <Link
                                href={`/apps/${review.appId?._id}`}
                                className="font-medium hover:text-primary transition-colors"
                              >
                                {review.appId?.title}
                              </Link>
                              <Badge variant="outline" className="text-xs">
                                {review.appId?.category}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <StarRating rating={review.rating} size="sm" />
                              <span className="text-xs text-muted-foreground">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {review.content}
                            </p>
                            <div className="flex items-center gap-4 mt-3">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <ThumbsUp className="h-3 w-3" />
                                {review.helpful} helpful
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </TabsContent>

            {/* Discussions Tab */}
            <TabsContent value="discussions" className="space-y-4">
              {discussions.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No discussions yet</h3>
                    <p className="text-muted-foreground">
                      This user hasn't started any discussions yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                discussions.map((discussion, index) => (
                  <motion.div
                    key={discussion._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={`/community/discussions/${discussion._id}`}>
                      <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {categoryLabels[discussion.category] || discussion.category}
                            </Badge>
                          </div>
                          <h3 className="font-medium mb-2 line-clamp-2">
                            {discussion.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3" />
                              {discussion.score}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {discussion.commentCount}
                            </span>
                            <span>{new Date(discussion.createdAt).toLocaleDateString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Badges Section */}
        {profile.badges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.badges.map((badge) => (
                    <Badge key={badge} variant="secondary" className="px-3 py-1">
                      {badge}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
