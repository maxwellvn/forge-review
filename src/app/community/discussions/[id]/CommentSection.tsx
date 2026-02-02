'use client';

import { useState, useCallback } from 'react';
import { CommentForm } from '@/components/comments/CommentForm';
import { CommentThread } from '@/components/comments/CommentThread';
import { Lock } from 'lucide-react';

interface Comment {
  _id: string;
  discussionId: string;
  parentId: string | null;
  authorId: {
    _id: string;
    name: string;
    image?: string;
    username?: string;
    role?: string;
  };
  content: string;
  contentHtml: string;
  depth: number;
  path: string;
  upvotes: number;
  downvotes: number;
  score: number;
  userVote: number | null;
  isDeleted?: boolean;
  isEdited?: boolean;
  createdAt: string;
}

interface CommentSectionProps {
  discussionId: string;
  initialComments: Comment[];
  isLocked?: boolean;
}

export function CommentSection({
  discussionId,
  initialComments,
  isLocked,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/discussions/${discussionId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments);
        setRefreshKey((k) => k + 1);
      }
    } catch (error) {
      console.error('Failed to refresh comments:', error);
    }
  }, [discussionId]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-lg sm:text-xl font-semibold">
        Comments ({comments.length})
      </h2>

      {isLocked ? (
        <div className="flex items-center gap-2 p-3 sm:p-4 border rounded-lg bg-muted/50 text-muted-foreground text-sm">
          <Lock size={14} className="flex-shrink-0 sm:w-4 sm:h-4" />
          <span>This discussion is locked. New comments are disabled.</span>
        </div>
      ) : (
        <CommentForm discussionId={discussionId} onSuccess={refreshComments} />
      )}

      <CommentThread
        key={refreshKey}
        comments={comments}
        discussionLocked={isLocked}
        onRefresh={refreshComments}
      />
    </div>
  );
}
