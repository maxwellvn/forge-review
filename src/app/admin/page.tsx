"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  AppWindow,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Shield,
  Star,
} from "lucide-react";
import Link from "next/link";

interface Stats {
  users: {
    total: number;
    banned: number;
    admins: number;
    moderators: number;
    verifiedReviewers: number;
    superReviewers: number;
  };
  apps: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  reviews: {
    total: number;
  };
}

interface RecentUser {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  createdAt: string;
}

interface RecentApp {
  _id: string;
  title: string;
  status: string;
  category: string;
  createdAt: string;
  uploader: { name: string; email: string };
}

interface RecentReview {
  _id: string;
  content: string;
  rating: number;
  createdAt: string;
  authorId: { name: string; email: string };
  appId: { title: string };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentApps, setRecentApps] = useState<RecentApp[]>([]);
  const [recentReviews, setRecentReviews] = useState<RecentReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        const data = await res.json();
        setStats(data.stats);
        setRecentUsers(data.recent.users);
        setRecentApps(data.recent.apps);
        setRecentReviews(data.recent.reviews);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your platform</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.users.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.users.banned || 0} banned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Apps</CardTitle>
            <AppWindow className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.apps.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.apps.approved || 0} approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Apps</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.apps.pending || 0}</div>
            <Link href="/admin/apps?status=pending" className="text-xs text-primary hover:underline">
              Review pending
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.reviews.total || 0}</div>
            <Link href="/admin/reviews" className="text-xs text-primary hover:underline">
              View all reviews
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Staff Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Admins</span>
            </div>
            <div className="text-2xl font-bold mt-2">{stats?.users.admins || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Moderators</span>
            </div>
            <div className="text-2xl font-bold mt-2">{stats?.users.moderators || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Verified Reviewers</span>
            </div>
            <div className="text-2xl font-bold mt-2">{stats?.users.verifiedReviewers || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Super Reviewers</span>
            </div>
            <div className="text-2xl font-bold mt-2">{stats?.users.superReviewers || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Latest registered users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentUsers.map((user) => (
              <div key={user._id} className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.image || ""} />
                  <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {user.role}
                </Badge>
              </div>
            ))}
            <Link href="/admin/users" className="block text-sm text-primary hover:underline text-center pt-2">
              View all users
            </Link>
          </CardContent>
        </Card>

        {/* Recent Apps */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Apps</CardTitle>
            <CardDescription>Latest submitted apps</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentApps.map((app) => (
              <div key={app._id} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                  <AppWindow className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{app.title}</p>
                  <p className="text-xs text-muted-foreground">by {app.uploader?.name}</p>
                </div>
                <Badge
                  variant={
                    app.status === "approved"
                      ? "default"
                      : app.status === "pending"
                      ? "secondary"
                      : "destructive"
                  }
                  className="text-xs"
                >
                  {app.status}
                </Badge>
              </div>
            ))}
            <Link href="/admin/apps" className="block text-sm text-primary hover:underline text-center pt-2">
              View all apps
            </Link>
          </CardContent>
        </Card>

        {/* Recent Reviews */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Reviews</CardTitle>
            <CardDescription>Latest user reviews</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentReviews.map((review) => (
              <div key={review._id} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{review.authorId?.name}</span>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{review.content}</p>
                <p className="text-xs text-muted-foreground">on {review.appId?.title}</p>
              </div>
            ))}
            <Link href="/admin/reviews" className="block text-sm text-primary hover:underline text-center pt-2">
              View all reviews
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
