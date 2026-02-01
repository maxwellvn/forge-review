'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Pin, Lock, Eye, Edit, Trash2, MoreVertical } from 'lucide-react';
import { VoteButtons } from '@/components/voting/VoteButtons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface Discussion {
  _id: string;
  title: string;
  content: string;
  contentHtml: string;
  authorId: {
    _id: string;
    name: string;
    image?: string;
    username?: string;
    role?: string;
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

interface DiscussionDetailProps {
  discussion: Discussion;
  userVote: number | null;
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

export function DiscussionDetail({ discussion, userVote }: DiscussionDetailProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = session?.user?.id === discussion.authorId._id;
  const isModerator =
    session?.user?.role === 'moderator' || session?.user?.role === 'admin';
  const canEdit = isOwner;
  const canDelete = isOwner || isModerator;
  const canModerate = isModerator;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/discussions/${discussion._id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.push('/community/discussions');
      }
    } catch (error) {
      console.error('Failed to delete discussion:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleModerate = async (action: 'pin' | 'lock' | 'hide') => {
    try {
      const updates: Record<string, boolean> = {};
      if (action === 'pin') updates.isPinned = !discussion.isPinned;
      if (action === 'lock') updates.isLocked = !discussion.isLocked;
      if (action === 'hide') updates.isHidden = true;

      await fetch(`/api/discussions/${discussion._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      router.refresh();
    } catch (error) {
      console.error('Failed to moderate discussion:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        {/* Vote buttons */}
        <div className="flex-shrink-0">
          <VoteButtons
            targetType="discussion"
            targetId={discussion._id}
            initialUpvotes={discussion.upvotes}
            initialDownvotes={discussion.downvotes}
            initialUserVote={userVote}
            orientation="vertical"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header badges */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {discussion.isPinned && (
              <Badge variant="secondary" className="bg-orange-500/10 text-orange-500">
                <Pin size={12} className="mr-1" />
                Pinned
              </Badge>
            )}
            {discussion.isLocked && (
              <Badge variant="secondary">
                <Lock size={12} className="mr-1" />
                Locked
              </Badge>
            )}
            <Badge
              variant="secondary"
              className={cn('text-xs', categoryColors[discussion.category])}
            >
              {categoryLabels[discussion.category]}
            </Badge>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold mb-4 break-words">{discussion.title}</h1>

          {/* Content */}
          <div
            className="prose prose-sm dark:prose-invert max-w-none break-words overflow-hidden"
            dangerouslySetInnerHTML={{ __html: discussion.contentHtml }}
          />

          {/* Footer */}
          <div className="flex items-center justify-between gap-4 mt-6 pt-4 border-t flex-wrap">
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap min-w-0">
              {/* Author */}
              <Link
                href={`/profile/${discussion.authorId._id}`}
                className="flex items-center gap-2 hover:text-foreground transition-colors min-w-0 max-w-[200px]"
              >
                {discussion.authorId.image ? (
                  <Image
                    src={discussion.authorId.image}
                    alt={discussion.authorId.name}
                    width={24}
                    height={24}
                    className="rounded-full flex-shrink-0"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-muted flex-shrink-0" />
                )}
                <span className="font-medium truncate">
                  {discussion.authorId.username || discussion.authorId.name}
                </span>
              </Link>

              {/* Time */}
              <span className="whitespace-nowrap">
                {formatDistanceToNow(new Date(discussion.createdAt), {
                  addSuffix: true,
                })}
              </span>

              {/* Stats */}
              <div className="flex items-center gap-1 whitespace-nowrap">
                <MessageSquare size={14} className="flex-shrink-0" />
                <span>{discussion.commentCount}</span>
              </div>
              <div className="flex items-center gap-1 whitespace-nowrap">
                <Eye size={14} className="flex-shrink-0" />
                <span>{discussion.viewCount}</span>
              </div>
            </div>

            {/* Actions */}
            {(canEdit || canDelete || canModerate) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canEdit && (
                    <DropdownMenuItem asChild>
                      <Link href={`/community/discussions/${discussion._id}/edit`}>
                        <Edit size={14} className="mr-2" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {canModerate && (
                    <>
                      <DropdownMenuItem onClick={() => handleModerate('pin')}>
                        <Pin size={14} className="mr-2" />
                        {discussion.isPinned ? 'Unpin' : 'Pin'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleModerate('lock')}>
                        <Lock size={14} className="mr-2" />
                        {discussion.isLocked ? 'Unlock' : 'Lock'}
                      </DropdownMenuItem>
                    </>
                  )}
                  {canDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setShowDeleteDialog(true)}
                      >
                        <Trash2 size={14} className="mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Discussion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this discussion? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
