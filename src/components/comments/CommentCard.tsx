'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { Reply, Edit, Trash2, MoreVertical } from 'lucide-react';
import { VoteButtons } from '@/components/voting/VoteButtons';
import { CommentForm } from './CommentForm';
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
  upvotes: number;
  downvotes: number;
  score: number;
  userVote: number | null;
  isDeleted?: boolean;
  isEdited?: boolean;
  createdAt: string;
}

interface CommentCardProps {
  comment: Comment;
  discussionLocked?: boolean;
  onReplyAdded?: () => void;
  onDeleted?: () => void;
}

const MAX_DEPTH = 4;

export function CommentCard({
  comment,
  discussionLocked,
  onReplyAdded,
  onDeleted,
}: CommentCardProps) {
  const { data: session } = useSession();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const isOwner = session?.user?.id === comment.authorId._id;
  const isModerator =
    session?.user?.role === 'moderator' || session?.user?.role === 'admin';
  const canReply = session?.user && !discussionLocked && comment.depth < MAX_DEPTH;
  const canEdit = isOwner && !comment.isDeleted;
  const canDelete = (isOwner || isModerator) && !comment.isDeleted;
  const isDeleted = comment.isDeleted || false;
  const isEdited = comment.isEdited || false;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/comments/${comment._id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        onDeleted?.();
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleEdit = async (content: string) => {
    try {
      const res = await fetch(`/api/comments/${comment._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        setShowEditForm(false);
        onReplyAdded?.(); // Refresh comments
      }
    } catch (error) {
      console.error('Failed to edit comment:', error);
    }
  };

  if (isDeleted) {
    return (
      <div className="py-3 text-sm text-muted-foreground italic">
        [deleted]
      </div>
    );
  }

  return (
    <div className="py-3">
      <div className="flex gap-3">
        {/* Vote buttons */}
        <div className="flex-shrink-0">
          <VoteButtons
            targetType="comment"
            targetId={comment._id}
            initialUpvotes={comment.upvotes}
            initialDownvotes={comment.downvotes}
            initialUserVote={comment.userVote}
            size="sm"
            orientation="vertical"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 text-sm">
            <Link
              href={`/profile/${comment.authorId._id}`}
              className="flex items-center gap-1.5 hover:underline"
            >
              {comment.authorId.image ? (
                <Image
                  src={comment.authorId.image}
                  alt={comment.authorId.name}
                  width={20}
                  height={20}
                  className="rounded-full"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-muted" />
              )}
              <span className="font-medium">
                {comment.authorId.username || comment.authorId.name}
              </span>
            </Link>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
              })}
            </span>
            {isEdited && (
              <span className="text-muted-foreground text-xs">(edited)</span>
            )}
          </div>

          {/* Content */}
          {showEditForm ? (
            <div className="mt-2">
              <CommentForm
                discussionId={comment.discussionId}
                mode="edit"
                initialContent={editContent}
                onSubmit={handleEdit}
                onCancel={() => setShowEditForm(false)}
              />
            </div>
          ) : (
            <div
              className="prose prose-sm dark:prose-invert max-w-none mt-1"
              dangerouslySetInnerHTML={{ __html: comment.contentHtml }}
            />
          )}

          {/* Actions */}
          {!showEditForm && (
            <div className="flex items-center gap-1 mt-2">
              {canReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                >
                  <Reply size={14} className="mr-1" />
                  Reply
                </Button>
              )}

              {(canEdit || canDelete) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <MoreVertical size={14} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {canEdit && (
                      <DropdownMenuItem onClick={() => setShowEditForm(true)}>
                        <Edit size={14} className="mr-2" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {canDelete && (
                      <>
                        {canEdit && <DropdownMenuSeparator />}
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
          )}

          {/* Reply form */}
          {showReplyForm && (
            <div className="mt-3">
              <CommentForm
                discussionId={comment.discussionId}
                parentId={comment._id}
                onSuccess={() => {
                  setShowReplyForm(false);
                  onReplyAdded?.();
                }}
                onCancel={() => setShowReplyForm(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be
              undone.
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
