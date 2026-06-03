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
import { Skeleton } from "@/components/ui/skeleton";
import {
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Eye,
  AppWindow,
  Flag,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const REASON_LABELS: Record<string, string> = {
  spam: "Spam or scam",
  inappropriate: "Inappropriate content",
  broken: "Broken or not working",
  misleading: "Misleading information",
  malware: "Malware or security risk",
  copyright: "Copyright violation",
  other: "Something else",
};

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof Clock }
> = {
  pending: { label: "Pending", variant: "destructive", icon: Clock },
  reviewing: { label: "Reviewing", variant: "default", icon: Loader2 },
  resolved: { label: "Resolved", variant: "secondary", icon: CheckCircle2 },
  dismissed: { label: "Dismissed", variant: "outline", icon: XCircle },
};

const STATUS_FILTERS = ["all", "pending", "reviewing", "resolved", "dismissed"];

interface Report {
  _id: string;
  reason: string;
  details: string;
  status: string;
  adminNotes?: string;
  createdAt: string;
  reporterId: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  } | null;
  appId: {
    _id: string;
    title: string;
    iconUrl?: string;
  } | null;
  resolvedBy?: { _id: string; name: string } | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function AdminReportsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [reports, setReports] = useState<Report[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const statusFilter = searchParams.get("status") || "all";

  // Dialog states
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", searchParams.get("page") || "1");
      const status = searchParams.get("status");
      if (status && status !== "all") params.set("status", status);

      const res = await fetch(`/api/admin/reports?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setReports(data.reports);
        setPagination(data.pagination);
        setPendingCount(data.pendingCount || 0);
      } else {
        toast.error(data.error || "Failed to fetch reports");
      }
    } catch {
      toast.error("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleFilterChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status === "all") {
      params.delete("status");
    } else {
      params.set("status", status);
    }
    params.set("page", "1");
    router.push(`/admin/reports?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/admin/reports?${params.toString()}`);
  };

  const handleStatusUpdate = async (report: Report, status: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/reports/${report._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Report marked as ${STATUS_CONFIG[status]?.label || status}`);
        fetchReports();
      } else {
        toast.error(data.error || "Failed to update report");
      }
    } catch {
      toast.error("Failed to update report");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteReport = async () => {
    if (!selectedReport) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/reports/${selectedReport._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Report deleted");
        setDeleteDialogOpen(false);
        fetchReports();
      } else {
        toast.error(data.error || "Failed to delete report");
      }
    } catch {
      toast.error("Failed to delete report");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">
          User-submitted reports about apps
          {pendingCount > 0 && (
            <span className="ml-2 inline-flex items-center gap-1 text-destructive font-medium">
              <Flag className="h-3.5 w-3.5" />
              {pendingCount} open
            </span>
          )}
        </p>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange(status)}
            className="capitalize"
          >
            {status}
          </Button>
        ))}
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-x-auto">
        <Table className="admin-table">
          <TableHeader>
            <TableRow>
              <TableHead>App</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Reporter</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <Flag className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  No reports found
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => {
                const status = STATUS_CONFIG[report.status] || STATUS_CONFIG.pending;
                const StatusIcon = status.icon;
                return (
                  <TableRow key={report._id}>
                    <TableCell>
                      {report.appId ? (
                        <Link
                          href={`/apps/${report.appId._id}`}
                          className="flex items-center gap-2 hover:underline"
                        >
                          <div className="h-8 w-8 rounded bg-muted flex items-center justify-center overflow-hidden shrink-0">
                            {report.appId.iconUrl ? (
                              <img src={report.appId.iconUrl} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <AppWindow className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <span className="text-sm truncate max-w-[120px]">{report.appId.title}</span>
                        </Link>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">Deleted app</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{REASON_LABELS[report.reason] || report.reason}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={report.reporterId?.image || ""} />
                          <AvatarFallback className="text-xs">
                            {report.reporterId?.name?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm truncate max-w-[100px]">
                          {report.reporterId?.name || "Unknown"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant} className="text-xs gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedReport(report);
                              setViewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(report, "reviewing")}
                            disabled={report.status === "reviewing"}
                          >
                            <Loader2 className="h-4 w-4 mr-2" />
                            Mark Reviewing
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(report, "resolved")}
                            disabled={report.status === "resolved"}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Mark Resolved
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(report, "dismissed")}
                            disabled={report.status === "dismissed"}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Dismiss
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedReport(report);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Report
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} reports
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

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={selectedReport.reporterId?.image || ""} />
                  <AvatarFallback>{selectedReport.reporterId?.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-medium truncate">{selectedReport.reporterId?.name || "Unknown"}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {selectedReport.reporterId?.email}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">App:</span>
                  <p className="font-medium">{selectedReport.appId?.title || "Deleted app"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Reason:</span>
                  <p className="font-medium">
                    {REASON_LABELS[selectedReport.reason] || selectedReport.reason}
                  </p>
                </div>
              </div>
              {selectedReport.details && (
                <div>
                  <span className="text-sm text-muted-foreground">Details:</span>
                  <p className="mt-1 text-sm whitespace-pre-wrap rounded-md bg-muted p-3">
                    {selectedReport.details}
                  </p>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Reported {new Date(selectedReport.createdAt).toLocaleString()}</span>
              </div>
              {selectedReport.appId && (
                <Link href={`/apps/${selectedReport.appId._id}`}>
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <AppWindow className="h-4 w-4" />
                    Open App Page
                  </Button>
                </Link>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Report</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this report? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteReport} disabled={actionLoading}>
              {actionLoading ? "Deleting..." : "Delete Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
