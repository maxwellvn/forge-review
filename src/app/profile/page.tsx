"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Edit3,
  MessageSquare,
  Settings,
  Camera,
  Crown,
  BadgeCheck,
  Shield,
  Star,
  Calendar,
  ThumbsUp,
  Award,
  Loader2,
  Save,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { StarRating } from "@/components/reviews/StarRating";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: "user" | "verified_reviewer" | "super_reviewer" | "moderator" | "admin";
  bio?: string;
  reviewsCount: number;
  helpfulVotes: number;
  joinedAt: string;
  isVerified: boolean;
  badges: string[];
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
    icon?: string;
    category: string;
  };
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

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", bio: "" });

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetchProfile();
      fetchReviews();
    }
  }, [status, session]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        setEditForm({ name: data.user.name, bio: data.user.bio || "" });
      } else {
        toast.error("Failed to load profile");
      }
    } catch (error) {
      toast.error("Error loading profile");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch("/api/user/reviews");
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        await update({ name: data.user.name });
        toast.success("Profile updated successfully");
        setIsEditing(false);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update profile");
      }
    } catch (error) {
      toast.error("Error updating profile");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  if (status === "loading" || isLoading) {
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

  if (!session) {
    redirect("/login");
  }

  if (!profile) {
    return (
      <div className="container py-12 text-center">
        <p className="text-muted-foreground">Failed to load profile</p>
      </div>
    );
  }

  const role = roleConfig[profile.role] || roleConfig.user;
  const RoleIcon = role.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
      <div className="container max-w-4xl">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 ring-4 ring-background shadow-lg">
                <AvatarImage src={profile.image} alt={profile.name} />
                <AvatarFallback className="text-2xl">
                  {profile.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <button className="absolute -bottom-1 -right-1 p-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors">
                <Camera className="h-4 w-4" />
              </button>
            </div>

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
              <p className="text-muted-foreground">{profile.email}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Member since {formatDate(profile.joinedAt)}
              </p>
            </div>

            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? (
                <>
                  <X className="h-4 w-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit3 className="h-4 w-4" />
                  Edit Profile
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            {
              label: "Reviews",
              value: profile.reviewsCount,
              icon: MessageSquare,
            },
            {
              label: "Helpful Votes",
              value: profile.helpfulVotes,
              icon: ThumbsUp,
            },
            {
              label: "Badges",
              value: profile.badges.length,
              icon: Award,
            },
            {
              label: "Joined",
              value: formatDate(profile.joinedAt).split(" ")[0],
              icon: Calendar,
            },
          ].map((stat, index) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <stat.icon className="h-5 w-5 text-muted-foreground mb-2" />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="gap-2">
                <User className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="reviews" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                My Reviews
                {reviews.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {reviews.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {isEditing ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Edit Profile</CardTitle>
                    <CardDescription>
                      Update your profile information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="name">Display Name</Label>
                      <Input
                        id="name"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        maxLength={50}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={editForm.bio}
                        onChange={(e) =>
                          setEditForm({ ...editForm, bio: e.target.value })
                        }
                        placeholder="Tell us about yourself..."
                        maxLength={500}
                        rows={4}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {editForm.bio.length}/500 characters
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="gap-2"
                      >
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          setEditForm({
                            name: profile.name,
                            bio: profile.bio || "",
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>About</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {profile.bio ? (
                        <p className="text-muted-foreground whitespace-pre-wrap">
                          {profile.bio}
                        </p>
                      ) : (
                        <p className="text-muted-foreground italic">
                          No bio added yet. Click "Edit Profile" to add one.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {profile.badges.length > 0 && (
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
                            <Badge
                              key={badge}
                              variant="secondary"
                              className="px-3 py-1"
                            >
                              {badge}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="space-y-4">
              {reviews.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start reviewing apps to build your reputation
                    </p>
                    <Button asChild>
                      <a href="/">Browse Apps</a>
                    </Button>
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
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={review.appId?.icon} />
                            <AvatarFallback>
                              {review.appId?.title?.[0] || "A"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <a
                                href={`/apps/${review.appId?._id}`}
                                className="font-medium hover:text-primary transition-colors"
                              >
                                {review.appId?.title}
                              </a>
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

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between py-4 border-b border-border">
                    <div>
                      <p className="font-medium">Email Address</p>
                      <p className="text-sm text-muted-foreground">
                        {profile.email}
                      </p>
                    </div>
                    <Badge variant="secondary">Verified</Badge>
                  </div>

                  <div className="flex items-center justify-between py-4 border-b border-border">
                    <div>
                      <p className="font-medium">Account Type</p>
                      <p className="text-sm text-muted-foreground">
                        {role.label}
                      </p>
                    </div>
                    <RoleIcon className={`h-5 w-5 ${role.color}`} />
                  </div>

                  <div className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium">Member Since</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(profile.joinedAt)}
                      </p>
                    </div>
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                  <CardDescription>
                    Irreversible actions for your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Sign Out</p>
                      <p className="text-sm text-muted-foreground">
                        Sign out from your account on this device
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Sign out logic would go here
                        toast.info("Sign out functionality coming soon");
                      }}
                    >
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
