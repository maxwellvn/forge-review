"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Eye,
  Star,
  AppWindow,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useCategories } from "@/hooks/useCategories";

interface App {
  _id: string;
  title: string;
  shortDescription: string;
  category: string;
  status: string;
  isVerified: boolean;
  averageRating: number;
  totalReviews: number;
  views: number;
  iconUrl?: string;
  downloadUrl: string;
  createdAt: string;
  uploader: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const statuses = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function AdminAppsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { categories: appCategories } = useCategories("app");

  const [apps, setApps] = useState<App[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");

  // Dialog states
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchApps = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", searchParams.get("page") || "1");
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      if (category) params.set("category", category);

      const res = await fetch(`/api/admin/apps?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setApps(data.apps);
        setPagination(data.pagination);
      } else {
        toast.error(data.error || "Failed to fetch apps");
      }
    } catch (error) {
      toast.error("Failed to fetch apps");
    } finally {
      setLoading(false);
    }
  }, [searchParams, search, status, category]);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  const updateUrl = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    params.set("page", "1");
    router.push(`/admin/apps?${params.toString()}`);
  };

  const handleSearch = () => {
    updateUrl({ search, status, category });
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/admin/apps?${params.toString()}`);
  };

  const handleUpdateStatus = async (app: App, newStatus: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/apps/${app._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`App ${newStatus} successfully`);
        fetchApps();
      } else {
        toast.error(data.error || "Failed to update app");
      }
    } catch (error) {
      toast.error("Failed to update app");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleVerified = async (app: App) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/apps/${app._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified: !app.isVerified }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(
          app.isVerified ? "App unverified successfully" : "App verified successfully"
        );
        fetchApps();
      } else {
        toast.error(data.error || "Failed to update app");
      }
    } catch (error) {
      toast.error("Failed to update app");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteApp = async () => {
    if (!selectedApp) return;
    setActionLoading(true);

    try {
      const res = await fetch(`/api/admin/apps/${selectedApp._id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("App deleted successfully");
        setDeleteDialogOpen(false);
        fetchApps();
      } else {
        toast.error(data.error || "Failed to delete app");
      }
    } catch (error) {
      toast.error("Failed to delete app");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="gap-1 bg-green-500/10 text-green-500 hover:bg-green-500/20">
            <CheckCircle className="h-3 w-3" />
            Approved
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Apps</h1>
        <p className="text-muted-foreground">Manage all apps on the platform</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-2 flex-1 min-w-[200px]">
          <Input
            placeholder="Search apps..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <Select
          value={status}
          onValueChange={(value) => updateUrl({ search, status: value, category })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((s) => (
              <SelectItem key={s.value} value={s.value || "all"}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={category}
          onValueChange={(value) => updateUrl({ search, status, category: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {appCategories.map((c) => (
              <SelectItem key={c._id} value={c.name}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>App</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Uploader</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : apps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No apps found
                </TableCell>
              </TableRow>
            ) : (
              apps.map((app) => (
                <TableRow key={app._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center overflow-hidden">
                        {app.iconUrl ? (
                          <img
                            src={app.iconUrl}
                            alt={app.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <AppWindow className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="max-w-[200px]">
                        <div className="flex items-center gap-1">
                          <p className="font-medium truncate">{app.title}</p>
                          {app.isVerified && (
                            <CheckCircle className="h-4 w-4 text-blue-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {app.shortDescription}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{app.category}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(app.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span>{app.averageRating.toFixed(1)}</span>
                      <span className="text-muted-foreground">({app.totalReviews})</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={app.uploader?.image || ""} />
                        <AvatarFallback className="text-xs">
                          {app.uploader?.name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm truncate max-w-[100px]">
                        {app.uploader?.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/apps/${app._id}`} target="_blank">
                            <Eye className="h-4 w-4 mr-2" />
                            View App
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a href={app.downloadUrl} target="_blank" rel="noopener">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open Link
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {app.status !== "approved" && (
                          <DropdownMenuItem
                            onClick={() => handleUpdateStatus(app, "approved")}
                          >
                            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                            Approve
                          </DropdownMenuItem>
                        )}
                        {app.status !== "rejected" && (
                          <DropdownMenuItem
                            onClick={() => handleUpdateStatus(app, "rejected")}
                          >
                            <XCircle className="h-4 w-4 mr-2 text-red-500" />
                            Reject
                          </DropdownMenuItem>
                        )}
                        {app.status !== "pending" && (
                          <DropdownMenuItem
                            onClick={() => handleUpdateStatus(app, "pending")}
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            Set Pending
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleToggleVerified(app)}>
                          <CheckCircle className="h-4 w-4 mr-2 text-blue-500" />
                          {app.isVerified ? "Remove Verified" : "Mark Verified"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedApp(app);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete App
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} apps
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete App</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedApp?.title}"? This action cannot
              be undone and will remove all associated reviews.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteApp}
              disabled={actionLoading}
            >
              {actionLoading ? "Deleting..." : "Delete App"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
