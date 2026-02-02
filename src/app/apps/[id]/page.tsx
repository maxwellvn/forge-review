"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Star,
  Download,
  ExternalLink,
  Share2,
  Flag,
  CheckCircle2,
  MessageSquare,
  TrendingUp,
  Pencil,
  Trash2,
  X,
  Plus,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "@/components/reviews/StarRating";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCategories } from "@/hooks/useCategories";

interface App {
  _id: string;
  title: string;
  description: string;
  shortDescription: string;
  iconUrl?: string;
  screenshots?: string[];
  category: string;
  submissionType: string;
  downloadUrl: string;
  averageRating: number;
  totalReviews: number;
  isVerified: boolean;
  pulseScore: number;
  tags: string[];
  views: number;
  createdAt: string;
  uploader: {
    _id: string;
    name: string;
    image?: string;
    role: string;
  };
}

interface Review {
  _id: string;
  content: string;
  rating: number;
  isSuperReview: boolean;
  likes: number;
  helpful: number;
  unhelpful: number;
  createdAt: string;
  authorId: {
    name: string;
    image?: string;
    role: string;
    isVerified: boolean;
  };
}

export default function AppDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { categories } = useCategories("app");
  const [app, setApp] = useState<App | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Review dialog state
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    shortDescription: "",
    description: "",
    category: "",
    downloadUrl: "",
    iconUrl: "",
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState("");
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchApp();
    fetchReviews();
  }, [params.id]);

  const fetchApp = async () => {
    try {
      const res = await fetch(`/api/apps/${params.id}`);
      const data = await res.json();
      setApp(data.app);
    } catch (error) {
      console.error("Error fetching app:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?appId=${params.id}`);
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleWriteReviewClick = () => {
    if (!session) {
      toast.error("Please sign in to write a review");
      return;
    }
    setReviewDialogOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!session) {
      toast.error("Please sign in to write a review");
      return;
    }

    const trimmedContent = reviewContent.trim();

    if (!trimmedContent) {
      toast.error("Please write your review");
      return;
    }

    if (trimmedContent.length < 10) {
      toast.error("Review must be at least 10 characters long");
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appId: params.id,
          rating: reviewRating,
          content: trimmedContent,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Review submitted successfully!");
        setReviewDialogOpen(false);
        setReviewContent("");
        setReviewRating(5);
        fetchReviews();
        fetchApp(); // Refresh app to update rating
      } else {
        toast.error(data.error || "Failed to submit review");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Check if current user is the owner
  const isOwner = session?.user?.id && app?.uploader?._id === session.user.id;
  const isAdminOrMod = session?.user?.role === 'admin' || session?.user?.role === 'moderator';
  const canEdit = isOwner || isAdminOrMod;

  const handleOpenEditDialog = () => {
    if (!app) return;
    setEditForm({
      title: app.title,
      shortDescription: app.shortDescription,
      description: app.description,
      category: app.category,
      downloadUrl: app.downloadUrl,
      iconUrl: app.iconUrl || "",
      tags: app.tags || [],
    });
    setEditDialogOpen(true);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !editForm.tags.includes(tagInput.trim()) && editForm.tags.length < 5) {
      setEditForm({ ...editForm, tags: [...editForm.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setEditForm({ ...editForm, tags: editForm.tags.filter((t) => t !== tag) });
  };

  const handleSubmitEdit = async () => {
    if (!app) return;

    setSubmittingEdit(true);
    try {
      const res = await fetch(`/api/apps/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "App updated successfully!");
        setEditDialogOpen(false);
        fetchApp();
      } else {
        toast.error(data.error || "Failed to update app");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleDeleteApp = async () => {
    if (!app) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/apps/${params.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("App deleted successfully");
        router.push("/");
      } else {
        toast.error(data.error || "Failed to delete app");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-[400px] mb-8" />
        <Skeleton className="h-[300px]" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold mb-2">App Not Found</h1>
        <p className="text-muted-foreground">
          The app you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-to-b from-muted/50 to-background">
        <div className="container py-6 sm:py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">
            {/* App Icon & Actions */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-shrink-0 flex sm:block justify-center"
            >
              <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center text-3xl sm:text-4xl lg:text-5xl font-bold overflow-hidden border-2 border-border shadow-lg">
                {app.iconUrl ? (
                  <img
                    src={app.iconUrl}
                    alt={app.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  app.title[0]?.toUpperCase()
                )}
              </div>
            </motion.div>

            {/* App Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 min-w-0"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">{app.title}</h1>
                    {app.isVerified && (
                      <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
                    {app.shortDescription}
                  </p>
                </div>
                <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
                  {canEdit && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleOpenEditDialog}
                        title="Edit app"
                        className="h-9 w-9 sm:h-10 sm:w-10"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setDeleteDialogOpen(true)}
                        title="Delete app"
                        className="text-destructive hover:text-destructive h-9 w-9 sm:h-10 sm:w-10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button variant="outline" size="icon" className="h-9 w-9 sm:h-10 sm:w-10">
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-9 w-9 sm:h-10 sm:w-10">
                    <Flag className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3 sm:mt-4">
                <Badge variant="secondary" className="text-xs sm:text-sm">
                  {app.category}
                </Badge>
                <Badge variant="outline" className="text-xs sm:text-sm gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Pulse: {app.pulseScore}
                </Badge>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {app.views.toLocaleString()} views
                </span>
              </div>

              <div className="flex items-center gap-3 sm:gap-6 mt-4 sm:mt-6">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <StarRating rating={Math.round(app.averageRating)} size="lg" />
                  <span className="text-xl sm:text-2xl font-bold">{app.averageRating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">
                    ({app.totalReviews})
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-6">
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  {app.submissionType === "package" ? (
                    <Download className="h-4 w-4" />
                  ) : (
                    <ExternalLink className="h-4 w-4" />
                  )}
                  {app.submissionType === "package" ? "Download" : "Visit"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 w-full sm:w-auto"
                  onClick={handleWriteReviewClick}
                >
                  <MessageSquare className="h-4 w-4" />
                  Write Review
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="container py-6 sm:py-8 lg:py-12">
        <Tabs defaultValue="overview" className="space-y-6 sm:space-y-8">
          <TabsList className="grid w-full sm:w-auto sm:min-w-[320px] grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({app.totalReviews})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">About</h2>
                  <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {app.description}
                  </p>
                </div>

                {app.screenshots && app.screenshots.length > 0 && (
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Screenshots</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                      {app.screenshots.map((screenshot, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.02 }}
                          className="aspect-video rounded-lg border border-border overflow-hidden"
                        >
                          <img
                            src={screenshot}
                            alt={`Screenshot ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="p-4 sm:p-6 rounded-xl border border-border bg-card">
                  <h3 className="font-semibold mb-3 sm:mb-4">Developer</h3>
                  <Link href={`/profile/${app.uploader._id}`} className="flex items-center gap-3 hover:bg-muted/50 -m-2 p-2 rounded-lg transition-colors">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={app.uploader.image} />
                      <AvatarFallback>{app.uploader.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium truncate hover:text-primary transition-colors">{app.uploader.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {app.uploader.role.replace("_", " ")}
                      </p>
                    </div>
                  </Link>
                </div>

                <div className="p-4 sm:p-6 rounded-xl border border-border bg-card">
                  <h3 className="font-semibold mb-3 sm:mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {app.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs sm:text-sm">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="lg:col-span-2 space-y-4 sm:space-y-6 order-2 lg:order-1">
                {reviews.length > 0 ? (
                  reviews.map((review, index) => (
                    <ReviewCard key={review._id} review={review} index={index} />
                  ))
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-base sm:text-lg font-semibold mb-2">No reviews yet</h3>
                    <p className="text-sm sm:text-base text-muted-foreground mb-4">
                      Be the first to review this app!
                    </p>
                    <Button onClick={handleWriteReviewClick}>
                      Write a Review
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
                <div className="p-4 sm:p-6 rounded-xl border border-border bg-card">
                  <h3 className="font-semibold mb-3 sm:mb-4">Rating Breakdown</h3>
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-3 mb-2">
                      <span className="text-xs sm:text-sm w-6 sm:w-8">{star}★</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 rounded-full"
                          style={{
                            width: `${
                              reviews.length > 0
                                ? (reviews.filter((r) => r.rating === star).length /
                                    reviews.length) *
                                  100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-xs sm:text-sm text-muted-foreground w-8 sm:w-10 text-right">
                        {reviews.filter((r) => r.rating === star).length}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Write Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto w-[calc(100%-2rem)] sm:w-full p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Write a Review</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Share your experience with {app.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 sm:space-y-6 py-2">
            <div className="space-y-2 sm:space-y-3">
              <Label className="text-sm sm:text-base">Your Rating</Label>
              <div className="flex items-center gap-1 sm:gap-2 justify-center p-3 sm:p-4 rounded-lg bg-muted/50">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1 hover:scale-125 transition-transform min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <Star
                      className={`h-8 w-8 sm:h-10 sm:w-10 ${
                        star <= reviewRating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-muted-foreground">
                {reviewRating === 1 && "Poor"}
                {reviewRating === 2 && "Fair"}
                {reviewRating === 3 && "Good"}
                {reviewRating === 4 && "Very Good"}
                {reviewRating === 5 && "Excellent"}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="review" className="text-sm sm:text-base">Your Review</Label>
              <Textarea
                id="review"
                placeholder="What did you like or dislike about this app? Share your experience to help others..."
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                rows={5}
                maxLength={5000}
                className="resize-none text-sm sm:text-base"
              />
              <p className={`text-xs text-right ${reviewContent.trim().length < 10 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {reviewContent.trim().length < 10
                  ? `${reviewContent.trim().length}/10 minimum`
                  : `${reviewContent.length}/5000`}
              </p>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              onClick={() => setReviewDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={submittingReview || reviewContent.trim().length < 10}
              className="w-full sm:w-auto"
            >
              {submittingReview ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit App Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto w-[calc(100%-2rem)] sm:w-full p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Edit App</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Update your app details. {!isAdminOrMod && "Changes will require re-approval."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* App Icon Section */}
            <div className="space-y-3 p-3 sm:p-4 border rounded-lg bg-muted/30">
              <Label className="text-sm sm:text-base font-medium flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                App Icon
              </Label>
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden border-2 border-dashed border-border bg-muted flex items-center justify-center shrink-0">
                  {editForm.iconUrl ? (
                    <img
                      src={editForm.iconUrl}
                      alt="Icon preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`flex flex-col items-center ${editForm.iconUrl ? 'hidden' : ''}`}>
                    <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                  </div>
                </div>
                <div className="flex-1 space-y-2 w-full">
                  <Input
                    id="edit-icon"
                    value={editForm.iconUrl}
                    onChange={(e) => setEditForm({ ...editForm, iconUrl: e.target.value })}
                    placeholder="https://example.com/icon.png"
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a direct link to your app icon image (PNG, JPG, WebP)
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title" className="text-sm sm:text-base">App Name</Label>
                <Input
                  id="edit-title"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="App name"
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category" className="text-sm sm:text-base">Category</Label>
                <Select
                  value={editForm.category}
                  onValueChange={(value) => setEditForm({ ...editForm, category: value })}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-url" className="text-sm sm:text-base">App URL</Label>
              <Input
                id="edit-url"
                value={editForm.downloadUrl}
                onChange={(e) => setEditForm({ ...editForm, downloadUrl: e.target.value })}
                placeholder="https://..."
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-short-desc" className="text-sm sm:text-base">Short Description</Label>
              <Textarea
                id="edit-short-desc"
                value={editForm.shortDescription}
                onChange={(e) => setEditForm({ ...editForm, shortDescription: e.target.value })}
                placeholder="Brief description (max 200 chars)"
                maxLength={200}
                rows={2}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-desc" className="text-sm sm:text-base">Full Description</Label>
              <Textarea
                id="edit-desc"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Detailed description"
                rows={3}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm sm:text-base">Tags (max 5)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                  className="text-sm"
                />
                <Button type="button" variant="outline" onClick={handleAddTag} className="px-3">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {editForm.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 text-xs sm:text-sm">
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive min-h-[20px] min-w-[20px] flex items-center justify-center"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 mt-4">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleSubmitEdit} disabled={submittingEdit} className="w-full sm:w-auto">
              {submittingEdit ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete App</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{app.title}"? This action cannot be undone
              and will remove all associated reviews.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteApp}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}