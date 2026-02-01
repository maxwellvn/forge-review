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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Eye,
  Pin,
  PinOff,
  Lock,
  Unlock,
  EyeOff,
  MessageSquare,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Discussion {
  _id: string;
  title: string;
  content: string;
  category: string;
  isPinned: boolean;
  isLocked: boolean;
  isHidden: boolean;
  upvotes: number;
  downvotes: number;
  score: number;
  commentCount: number;
  viewCount: number;
  createdAt: string;
  authorId: {
    _id: string;
    name: string;
    email?: string;
    image?: string;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const categoryColors: Record<string, string> = {
  general: "bg-gray-500/10 text-gray-500",
  feedback: "bg-blue-500/10 text-blue-500",
  bug_report: "bg-red-500/10 text-red-500",
  feature_request: "bg-purple-500/10 text-purple-500",
  showcase: "bg-green-500/10 text-green-500",
  question: "bg-yellow-500/10 text-yellow-600",
};

const categoryLabels: Record<string, string> = {
  general: "General",
  feedback: "Feedback",
  bug_report: "Bug Report",
  feature_request: "Feature Request",
  showcase: "Showcase",
  question: "Question",
};

export default function AdminDiscussionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") || "all");

  // Dialog states
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDiscussions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", searchParams.get("page") || "1");
      params.set("limit", "20");
      if (search) params.set("search", search);
      if (categoryFilter && categoryFilter !== "all") params.set("category", categoryFilter);

      const res = await fetch(`/api/admin/discussions?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setDiscussions(data.discussions);
        setPagination(data.pagination);
      } else {
        toast.error(data.error || "Failed to fetch discussions");
      }
    } catch (error) {
      toast.error("Failed to fetch discussions");
    } finally {
      setLoading(false);
    }
  }, [searchParams, search, categoryFilter]);

  useEffect(() => {
    fetchDiscussions();
  }, [fetchDiscussions]);

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(`/admin/discussions?${params.toString()}`);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set("category", value);
    } else {
      params.delete("category");
    }
    params.set("page", "1");
    router.push(`/admin/discussions?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/admin/discussions?${params.toString()}`);
  };

  const handleTogglePin = async (discussion: Discussion) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/discussions/${discussion._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: !discussion.isPinned }),
      });

      if (res.ok) {
        toast.success(discussion.isPinned ? "Discussion unpinned" : "Discussion pinned");
        fetchDiscussions();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update discussion");
      }
    } catch (error) {
      toast.error("Failed to update discussion");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleLock = async (discussion: Discussion) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/discussions/${discussion._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLocked: !discussion.isLocked }),
      });

      if (res.ok) {
        toast.success(discussion.isLocked ? "Discussion unlocked" : "Discussion locked");
        fetchDiscussions();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update discussion");
      }
    } catch (error) {
      toast.error("Failed to update discussion");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleHidden = async (discussion: Discussion) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/discussions/${discussion._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isHidden: !discussion.isHidden }),
      });

      if (res.ok) {
        toast.success(discussion.isHidden ? "Discussion visible" : "Discussion hidden");
        fetchDiscussions();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update discussion");
      }
    } catch (error) {
      toast.error("Failed to update discussion");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDiscussion = async () => {
    if (!selectedDiscussion) return;
    setActionLoading(true);

    try {
      const res = await fetch(`/api/admin/discussions/${selectedDiscussion._id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Discussion deleted successfully");
        setDeleteDialogOpen(false);
        fetchDiscussions();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete discussion");
      }
    } catch (error) {
      toast.error("Failed to delete discussion");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Discussions</h1>
        <p className="text-muted-foreground">Moderate community discussions</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex gap-2 flex-1 max-w-md">
          <Input
            placeholder="Search discussions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <Select value={categoryFilter} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="feedback">Feedback</SelectItem>
            <SelectItem value="bug_report">Bug Report</SelectItem>
            <SelectItem value="feature_request">Feature Request</SelectItem>
            <SelectItem value="showcase">Showcase</SelectItem>
            <SelectItem value="question">Question</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Discussion</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Comments</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-12 w-64" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : discussions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No discussions found
                </TableCell>
              </TableRow>
            ) : (
              discussions.map((discussion) => (
                <TableRow key={discussion._id} className={discussion.isHidden ? "opacity-50" : ""}>
                  <TableCell className="max-w-[300px]">
                    <Link
                      href={`/community/discussions/${discussion._id}`}
                      className="hover:underline"
                    >
                      <p className="font-medium line-clamp-1">{discussion.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {discussion.content}
                      </p>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={categoryColors[discussion.category]}
                    >
                      {categoryLabels[discussion.category]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={discussion.authorId?.image || ""} />
                        <AvatarFallback className="text-xs">
                          {discussion.authorId?.name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm truncate max-w-[100px]">
                        {discussion.authorId?.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <ChevronUp className="h-3 w-3 text-orange-500" />
                      <span className={`text-sm font-medium ${
                        discussion.score > 0 ? "text-orange-500" :
                        discussion.score < 0 ? "text-blue-500" : ""
                      }`}>
                        {discussion.score}
                      </span>
                      <ChevronDown className="h-3 w-3 text-blue-500" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <MessageSquare className="h-3 w-3" />
                      {discussion.commentCount}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {discussion.isPinned && (
                        <Badge variant="secondary" className="text-xs bg-orange-500/10 text-orange-500">
                          <Pin className="h-3 w-3 mr-1" />
                          Pinned
                        </Badge>
                      )}
                      {discussion.isLocked && (
                        <Badge variant="secondary" className="text-xs">
                          <Lock className="h-3 w-3 mr-1" />
                          Locked
                        </Badge>
                      )}
                      {discussion.isHidden && (
                        <Badge variant="secondary" className="text-xs">
                          <EyeOff className="h-3 w-3 mr-1" />
                          Hidden
                        </Badge>
                      )}
                      {!discussion.isPinned && !discussion.isLocked && !discussion.isHidden && (
                        <span className="text-xs text-muted-foreground">Active</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(discussion.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={actionLoading}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedDiscussion(discussion);
                            setViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/community/discussions/${discussion._id}`}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            View on Site
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleTogglePin(discussion)}>
                          {discussion.isPinned ? (
                            <>
                              <PinOff className="h-4 w-4 mr-2" />
                              Unpin
                            </>
                          ) : (
                            <>
                              <Pin className="h-4 w-4 mr-2" />
                              Pin
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleLock(discussion)}>
                          {discussion.isLocked ? (
                            <>
                              <Unlock className="h-4 w-4 mr-2" />
                              Unlock
                            </>
                          ) : (
                            <>
                              <Lock className="h-4 w-4 mr-2" />
                              Lock
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleHidden(discussion)}>
                          <EyeOff className="h-4 w-4 mr-2" />
                          {discussion.isHidden ? "Show" : "Hide"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedDiscussion(discussion);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
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
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} discussions
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
              disabled={pagination.page >= pagination.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Discussion Details</DialogTitle>
          </DialogHeader>
          {selectedDiscussion && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={selectedDiscussion.authorId?.image || ""} />
                  <AvatarFallback>
                    {selectedDiscussion.authorId?.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedDiscussion.authorId?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedDiscussion.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div>
                <Badge
                  variant="secondary"
                  className={categoryColors[selectedDiscussion.category]}
                >
                  {categoryLabels[selectedDiscussion.category]}
                </Badge>
              </div>
              <div>
                <h3 className="font-semibold text-lg">{selectedDiscussion.title}</h3>
                <p className="mt-2 whitespace-pre-wrap">{selectedDiscussion.content}</p>
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground border-t pt-4">
                <span className="flex items-center gap-1">
                  <ChevronUp className="h-4 w-4 text-orange-500" />
                  {selectedDiscussion.upvotes} upvotes
                </span>
                <span className="flex items-center gap-1">
                  <ChevronDown className="h-4 w-4 text-blue-500" />
                  {selectedDiscussion.downvotes} downvotes
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {selectedDiscussion.commentCount} comments
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {selectedDiscussion.viewCount} views
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
            <Button asChild>
              <Link href={`/community/discussions/${selectedDiscussion?._id}`}>
                View on Site
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Discussion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this discussion? This will also delete all
              comments and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteDiscussion}
              disabled={actionLoading}
            >
              {actionLoading ? "Deleting..." : "Delete Discussion"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
