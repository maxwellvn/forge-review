'use client';

import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Pin, Lock, Eye } from 'lucide-react';
import { VoteButtons } from '@/components/voting/VoteButtons';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Discussion {
  _id: string;
  title: string;
  content: string;
  authorId: {
    _id: string;
    name: string;
    image?: string;
    username?: string;
  };
  category: string;
  upvotes: number;
  downvotes: number;
  score: number;
  commentCount: number;
  viewCount: number;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
}

interface DiscussionCardProps {
  discussion: Discussion;
  userVote?: number | null;
}

const categoryColors: Record<string, string> = {
  general: 'bg-gray-500/10 text-gray-500',
  feedback: 'bg-blue-500/10 text-blue-500',
  bug_report: 'bg-red-500/10 text-red-500',
  feature_request: 'bg-purple-500/10 text-purple-500',
  showcase: 'bg-green-500/10 text-green-500',
  question: 'bg-yellow-500/10 text-yellow-600',
};

const categoryLabels: Record<string, string> = {
  general: 'General',
  feedback: 'Feedback',
  bug_report: 'Bug Report',
  feature_request: 'Feature Request',
  showcase: 'Showcase',
  question: 'Question',
};

export function DiscussionCard({ discussion, userVote }: DiscussionCardProps) {
  const {
    _id,
    title,
    content,
    authorId,
    category,
    upvotes,
    downvotes,
    commentCount,
    viewCount,
    isPinned,
    isLocked,
    createdAt,
  } = discussion;

  // Truncate content for preview
  const contentPreview =
    content.length > 150 ? content.slice(0, 150) + '...' : content;

  return (
    <div
      className={cn(
        'flex gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors',
        isPinned && 'border-orange-500/50 bg-orange-500/5'
      )}
    >
      {/* Vote buttons - hidden on mobile, shown inline in footer instead */}
      <div className="hidden sm:block flex-shrink-0">
        <VoteButtons
          targetType="discussion"
          targetId={_id}
          initialUpvotes={upvotes}
          initialDownvotes={downvotes}
          initialUserVote={userVote || null}
          size="sm"
          orientation="vertical"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 flex-wrap mb-1">
          {isPinned && (
            <Pin size={12} className="text-orange-500 flex-shrink-0 sm:w-3.5 sm:h-3.5" />
          )}
          {isLocked && (
            <Lock size={12} className="text-muted-foreground flex-shrink-0 sm:w-3.5 sm:h-3.5" />
          )}
          <Badge
            variant="secondary"
            className={cn('text-[10px] sm:text-xs px-1.5 py-0 sm:px-2 sm:py-0.5', categoryColors[category])}
          >
            {categoryLabels[category]}
          </Badge>
        </div>

        {/* Title */}
        <Link
          href={`/community/discussions/${_id}`}
          className="block group"
        >
          <h3 className="text-sm sm:text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h3>
        </Link>

        {/* Preview - hidden on small mobile */}
        <p className="hidden xs:block text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
          {contentPreview}
        </p>

        {/* Footer */}
        <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-3 text-[10px] sm:text-xs text-muted-foreground flex-wrap">
          {/* Mobile vote buttons */}
          <div className="sm:hidden flex-shrink-0">
            <VoteButtons
              targetType="discussion"
              targetId={_id}
              initialUpvotes={upvotes}
              initialDownvotes={downvotes}
              initialUserVote={userVote || null}
              size="sm"
              orientation="horizontal"
            />
          </div>

          {/* Author */}
          <Link
            href={`/profile/${authorId._id}`}
            className="flex items-center gap-1 sm:gap-1.5 hover:text-foreground transition-colors min-w-0 max-w-[100px] sm:max-w-[150px]"
          >
            {authorId.image ? (
              <Image
                src={authorId.image}
                alt={authorId.name}
                width={16}
                height={16}
                className="rounded-full flex-shrink-0 sm:w-[18px] sm:h-[18px]"
              />
            ) : (
              <div className="w-4 h-4 sm:w-[18px] sm:h-[18px] rounded-full bg-muted flex-shrink-0" />
            )}
            <span className="truncate">{authorId.username || authorId.name}</span>
          </Link>

          {/* Time */}
          <span className="whitespace-nowrap hidden xs:inline">
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </span>

          {/* Comments */}
          <div className="flex items-center gap-0.5 sm:gap-1 whitespace-nowrap">
            <MessageSquare size={12} className="flex-shrink-0 sm:w-3.5 sm:h-3.5" />
            <span>{commentCount}</span>
          </div>

          {/* Views - hidden on small mobile */}
          <div className="hidden xs:flex items-center gap-0.5 sm:gap-1 whitespace-nowrap">
            <Eye size={12} className="flex-shrink-0 sm:w-3.5 sm:h-3.5" />
            <span>{viewCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
