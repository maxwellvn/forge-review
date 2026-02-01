'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useCreateComment } from '@/hooks/useDiscussion';
import { MentionInput } from '@/components/mentions/MentionInput';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

interface CommentFormProps {
  discussionId: string;
  parentId?: string;
  mode?: 'create' | 'edit';
  initialContent?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  onSubmit?: (content: string) => Promise<void>;
}

export function CommentForm({
  discussionId,
  parentId,
  mode = 'create',
  initialContent = '',
  onSuccess,
  onCancel,
  onSubmit,
}: CommentFormProps) {
  const { data: session } = useSession();
  const { createComment, isCreating } = useCreateComment(discussionId);

  const [content, setContent] = useState(initialContent);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!content.trim()) {
      setError('Comment cannot be empty');
      return;
    }
    if (content.length > 5000) {
      setError('Comment must be 5000 characters or less');
      return;
    }

    try {
      if (mode === 'edit' && onSubmit) {
        setIsSubmitting(true);
        await onSubmit(content);
      } else {
        await createComment({ content, parentId });
        setContent('');
        onSuccess?.();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isCreating || isSubmitting;

  if (!session?.user) {
    return (
      <div className="p-4 border rounded-lg bg-muted/50 text-center">
        <p className="text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>{' '}
          to join the discussion
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <MentionInput
        value={content}
        onChange={setContent}
        placeholder={
          parentId
            ? 'Write a reply...'
            : 'Add a comment... Use @username to mention users'
        }
        minRows={parentId ? 2 : 3}
        maxRows={10}
        disabled={isLoading}
      />

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{content.length}/5000</p>
        <div className="flex gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" size="sm" disabled={isLoading || !content.trim()}>
            {isLoading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
            {mode === 'edit' ? 'Save' : parentId ? 'Reply' : 'Comment'}
          </Button>
        </div>
      </div>
    </form>
  );
}
