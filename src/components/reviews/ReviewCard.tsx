"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { ThumbsUp, ThumbsDown, Award, Crown, Shield, BadgeCheck } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "./StarRating";
import { formatDistanceToNow, cn } from "@/lib/utils";
import { toast } from "sonner";

interface ReviewCardProps {
  review: {
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
  };
  index?: number;
  initialUserVote?: 'helpful' | 'unhelpful' | null;
}

const roleBadges = {
  admin: { icon: Shield, color: "bg-red-600", label: "Admin" },
  super_reviewer: { icon: Crown, color: "bg-purple-500", label: "Super Reviewer" },
  verified_reviewer: { icon: BadgeCheck, color: "bg-blue-500", label: "Verified" },
  moderator: { icon: Shield, color: "bg-orange-500", label: "Moderator" },
  user: null,
};

export function ReviewCard({ review, index = 0, initialUserVote = null }: ReviewCardProps) {
  const { data: session } = useSession();
  const [helpful, setHelpful] = useState(review.helpful || 0);
  const [unhelpful, setUnhelpful] = useState(review.unhelpful || 0);
  const [userVote, setUserVote] = useState<'helpful' | 'unhelpful' | null>(initialUserVote);
  const [isVoting, setIsVoting] = useState(false);

  const roleBadge = roleBadges[review.authorId.role as keyof typeof roleBadges];

  const handleVote = async (type: 'helpful' | 'unhelpful') => {
    if (!session) {
      toast.error("Please sign in to vote");
      return;
    }

    if (isVoting) return;

    setIsVoting(true);
    try {
      const res = await fetch(`/api/reviews/${review._id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      const data = await res.json();

      if (res.ok) {
        setHelpful(data.helpful);
        setUnhelpful(data.unhelpful);
        setUserVote(data.userVote);
      } else {
        toast.error(data.error || "Failed to record vote");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Card className={cn(
        "overflow-hidden",
        review.isSuperReview && "border-purple-500/30 bg-purple-500/5"
      )}>
        <CardHeader className="p-4 pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-border">
                <AvatarImage src={review.authorId.image} />
                <AvatarFallback>{review.authorId.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{review.authorId.name}</span>
                  {review.authorId.isVerified && (
                    <BadgeCheck className="h-4 w-4 text-blue-500" />
                  )}
                  {roleBadge && (
                    <Badge
                      variant="secondary"
                      className={cn("text-xs gap-1 text-white", roleBadge.color)}
                    >
                      <roleBadge.icon className="h-3 w-3" />
                      {roleBadge.label}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <StarRating rating={review.rating} size="sm" />
                  <span>•</span>
                  <span>{formatDistanceToNow(review.createdAt)}</span>
                </div>
              </div>
            </div>
            {review.isSuperReview && (
              <Badge className="bg-purple-500 text-white gap-1">
                <Award className="h-3 w-3" />
                Editorial
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-2">
          <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
            {review.content}
          </p>

          <div className="flex items-center gap-2 mt-4">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 gap-1.5 text-xs",
                userVote === 'helpful' && "bg-primary/10 text-primary"
              )}
              onClick={() => handleVote('helpful')}
              disabled={isVoting}
            >
              <ThumbsUp className={cn("h-3.5 w-3.5", userVote === 'helpful' && "fill-current")} />
              Helpful ({helpful})
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 gap-1.5 text-xs",
                userVote === 'unhelpful' && "bg-primary/10 text-primary"
              )}
              onClick={() => handleVote('unhelpful')}
              disabled={isVoting}
            >
              <ThumbsDown className={cn("h-3.5 w-3.5", userVote === 'unhelpful' && "fill-current")} />
              Not helpful ({unhelpful})
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
