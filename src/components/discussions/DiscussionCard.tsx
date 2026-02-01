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
        'flex gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors',
        isPinned && 'border-orange-500/50 bg-orange-500/5'
      )}
    >
      {/* Vote buttons */}
      <VoteButtons
        targetType="discussion"
        targetId={_id}
        initialUpvotes={upvotes}
        initialDownvotes={downvotes}
        initialUserVote={userVote || null}
        size="sm"
        orientation="vertical"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 flex-wrap mb-1">
          {isPinned && (
            <Pin size={14} className="text-orange-500 flex-shrink-0" />
          )}
          {isLocked && (
            <Lock size={14} className="text-muted-foreground flex-shrink-0" />
          )}
          <Badge
            variant="secondary"
            className={cn('text-xs', categoryColors[category])}
          >
            {categoryLabels[category]}
          </Badge>
        </div>

        {/* Title */}
        <Link
          href={`/community/discussions/${_id}`}
          className="block group"
        >
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h3>
        </Link>

        {/* Preview */}
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {contentPreview}
        </p>

        {/* Footer */}
        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground flex-wrap">
          {/* Author */}
          <Link
            href={`/profile/${authorId._id}`}
            className="flex items-center gap-1.5 hover:text-foreground transition-colors min-w-0 max-w-[150px]"
          >
            {authorId.image ? (
              <Image
                src={authorId.image}
                alt={authorId.name}
                width={18}
                height={18}
                className="rounded-full flex-shrink-0"
              />
            ) : (
              <div className="w-[18px] h-[18px] rounded-full bg-muted flex-shrink-0" />
            )}
            <span className="truncate">{authorId.username || authorId.name}</span>
          </Link>

          {/* Time */}
          <span className="whitespace-nowrap">
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </span>

          {/* Comments */}
          <div className="flex items-center gap-1 whitespace-nowrap">
            <MessageSquare size={14} className="flex-shrink-0" />
            <span>{commentCount}</span>
          </div>

          {/* Views */}
          <div className="flex items-center gap-1 whitespace-nowrap">
            <Eye size={14} className="flex-shrink-0" />
            <span>{viewCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
