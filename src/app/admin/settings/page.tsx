"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  Database,
  Server,
  Key,
  Globe,
  AlertTriangle,
} from "lucide-react";

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // Only admins can access this page
  useEffect(() => {
    if (session && session.user.role !== "admin") {
      router.push("/admin");
    }
  }, [session, router]);

  if (session?.user.role !== "admin") {
    return null;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Platform configuration and information</p>
      </div>

      {/* Environment Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Environment
          </CardTitle>
          <CardDescription>Current deployment environment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid-responsive-2">
            <div className="space-y-1">
              <p className="text-sm font-medium">Environment</p>
              <Badge variant="secondary">
                {process.env.NODE_ENV || "development"}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Next.js Version</p>
              <p className="text-sm text-muted-foreground">16.x</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database
          </CardTitle>
          <CardDescription>MongoDB connection status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-sm">Connected</span>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Database</p>
            <p className="text-sm text-muted-foreground font-mono">forge-review</p>
          </div>
        </CardContent>
      </Card>

      {/* Auth Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Authentication
          </CardTitle>
          <CardDescription>OAuth providers and auth settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span className="text-sm">Google OAuth</span>
              </div>
              <Badge variant="default">Enabled</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span className="text-sm">KingsChat OAuth</span>
              </div>
              <Badge variant="default">Enabled</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Emails */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Configuration
          </CardTitle>
          <CardDescription>
            Admin emails are configured in environment variables
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm font-medium mb-2">ADMIN_EMAILS</p>
            <p className="text-sm text-muted-foreground">
              Users with these emails are automatically granted admin privileges on sign-up.
              Configure this in your <code className="text-xs bg-muted px-1 py-0.5 rounded">.env.local</code> file.
            </p>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5">
            <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              To add new admins, update the <code className="text-xs bg-muted px-1 py-0.5 rounded">ADMIN_EMAILS</code> environment
              variable and restart the server. Existing users will be promoted on their next sign-in.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Role Descriptions */}
      <Card>
        <CardHeader>
          <CardTitle>User Roles</CardTitle>
          <CardDescription>Available roles and their permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              <Badge variant="destructive">admin</Badge>
              <div>
                <p className="text-sm font-medium">Administrator</p>
                <p className="text-sm text-muted-foreground">
                  Full platform access. Can manage users, apps, reviews, moderators, and settings.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              <Badge variant="default">moderator</Badge>
              <div>
                <p className="text-sm font-medium">Moderator</p>
                <p className="text-sm text-muted-foreground">
                  Can approve/reject apps and moderate reviews. Cannot manage users or other moderators.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              <Badge variant="secondary">super_reviewer</Badge>
              <div>
                <p className="text-sm font-medium">Super Reviewer</p>
                <p className="text-sm text-muted-foreground">
                  Trusted reviewer with highlighted reviews. Reviews are prioritized in listings.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              <Badge variant="outline">verified_reviewer</Badge>
              <div>
                <p className="text-sm font-medium">Verified Reviewer</p>
                <p className="text-sm text-muted-foreground">
                  Verified user badge. Reviews show verification status.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              <Badge variant="secondary">user</Badge>
              <div>
                <p className="text-sm font-medium">User</p>
                <p className="text-sm text-muted-foreground">
                  Standard user. Can submit apps, write reviews, and interact with the platform.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
