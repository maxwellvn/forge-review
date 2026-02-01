'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateDiscussion } from '@/hooks/useDiscussion';
import { MentionInput } from '@/components/mentions/MentionInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

const categories = [
  { value: 'general', label: 'General' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'bug_report', label: 'Bug Report' },
  { value: 'feature_request', label: 'Feature Request' },
  { value: 'showcase', label: 'Showcase' },
  { value: 'question', label: 'Question' },
];

interface DiscussionFormProps {
  initialData?: {
    title: string;
    content: string;
    category: string;
  };
  discussionId?: string;
  mode?: 'create' | 'edit';
}

export function DiscussionForm({
  initialData,
  discussionId,
  mode = 'create',
}: DiscussionFormProps) {
  const router = useRouter();
  const { createDiscussion, isCreating } = useCreateDiscussion();

  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [category, setCategory] = useState(initialData?.category || 'general');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!content.trim()) {
      setError('Content is required');
      return;
    }
    if (title.length > 200) {
      setError('Title must be 200 characters or less');
      return;
    }
    if (content.length > 10000) {
      setError('Content must be 10000 characters or less');
      return;
    }

    try {
      if (mode === 'create') {
        const result = await createDiscussion({ title, content, category });
        router.push(`/community/discussions/${result.discussion._id}`);
      } else if (discussionId) {
        setIsSubmitting(true);
        const res = await fetch(`/api/discussions/${discussionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to update discussion');
        }

        router.push(`/community/discussions/${discussionId}`);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isCreating || isSubmitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What do you want to discuss?"
          maxLength={200}
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground text-right">
          {title.length}/200
        </p>
      </div>

      {mode === 'create' && (
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory} disabled={isLoading}>
            <SelectTrigger id="category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <MentionInput
          value={content}
          onChange={setContent}
          placeholder="Share your thoughts... Use @username to mention users or #AppName to mention apps."
          minRows={6}
          maxRows={20}
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground text-right">
          {content.length}/10000
        </p>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'create' ? 'Create Discussion' : 'Save Changes'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
