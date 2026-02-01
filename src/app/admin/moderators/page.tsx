"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  Shield,
  ShieldOff,
  UserPlus,
  Star,
} from "lucide-react";
import { toast } from "sonner";

interface User {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  isVerified: boolean;
  reviewsCount: number;
  createdAt: string;
}

export default function AdminModeratorsPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [moderators, setModerators] = useState<User[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Add moderator states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Only admins can access this page
  useEffect(() => {
    if (session && session.user.role !== "admin") {
      router.push("/admin");
    }
  }, [session, router]);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const [modsRes, adminsRes] = await Promise.all([
        fetch("/api/admin/users?role=moderator&limit=100"),
        fetch("/api/admin/users?role=admin&limit=100"),
      ]);

      const modsData = await modsRes.json();
      const adminsData = await adminsRes.json();

      if (modsRes.ok) setModerators(modsData.users);
      if (adminsRes.ok) setAdmins(adminsData.users);
    } catch (error) {
      toast.error("Failed to fetch staff");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleSearch = async () => {
    if (!searchEmail.trim()) return;
    setSearching(true);

    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(searchEmail)}&limit=10`);
      const data = await res.json();

      if (res.ok) {
        // Filter out existing moderators and admins
        const filtered = data.users.filter(
          (u: User) => u.role !== "admin" && u.role !== "moderator"
        );
        setSearchResults(filtered);
      } else {
        toast.error(data.error || "Search failed");
      }
    } catch (error) {
      toast.error("Search failed");
    } finally {
      setSearching(false);
    }
  };

  const handlePromote = async (user: User, role: "moderator" | "verified_reviewer" | "super_reviewer") => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`User promoted to ${role}`);
        setAddDialogOpen(false);
        setSearchEmail("");
        setSearchResults([]);
        fetchStaff();
      } else {
        toast.error(data.error || "Failed to promote user");
      }
    } catch (error) {
      toast.error("Failed to promote user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDemote = async (user: User) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "user" }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("User demoted to regular user");
        fetchStaff();
      } else {
        toast.error(data.error || "Failed to demote user");
      }
    } catch (error) {
      toast.error("Failed to demote user");
    } finally {
      setActionLoading(false);
    }
  };

  if (session?.user.role !== "admin") {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground">Manage moderators and reviewers</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      {/* Admins Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-500" />
            Administrators
          </CardTitle>
          <CardDescription>
            Admins have full access to all platform features
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : admins.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No admins found</p>
          ) : (
            <div className="space-y-2">
              {admins.map((admin) => (
                <div
                  key={admin._id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={admin.image || ""} />
                      <AvatarFallback>{admin.name?.[0] || "A"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{admin.name}</p>
                      <p className="text-sm text-muted-foreground">{admin.email}</p>
                    </div>
                  </div>
                  <Badge variant="destructive">Admin</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Moderators Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-500" />
            Moderators
          </CardTitle>
          <CardDescription>
            Moderators can approve apps and moderate reviews
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : moderators.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No moderators yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Reviews</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {moderators.map((mod) => (
                  <TableRow key={mod._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={mod.image || ""} />
                          <AvatarFallback>{mod.name?.[0] || "M"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{mod.name}</p>
                          <p className="text-sm text-muted-foreground">{mod.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{mod.reviewsCount}</TableCell>
                    <TableCell>
                      {new Date(mod.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDemote(mod)}
                        disabled={actionLoading}
                      >
                        <ShieldOff className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Staff Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
            <DialogDescription>
              Search for a user by email or name to promote them
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search by email or name..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={searching}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {searching && (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            )}

            {!searching && searchResults.length > 0 && (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {searchResults.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.image || ""} />
                        <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePromote(user, "verified_reviewer")}
                        disabled={actionLoading}
                        title="Verified Reviewer"
                      >
                        <Star className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handlePromote(user, "moderator")}
                        disabled={actionLoading}
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        Mod
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!searching && searchEmail && searchResults.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No users found matching your search
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddDialogOpen(false);
                setSearchEmail("");
                setSearchResults([]);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
