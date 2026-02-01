'use client';

import { useVote } from '@/hooks/useVote';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoteButtonsProps {
  targetType: 'discussion' | 'comment';
  targetId: string;
  initialUpvotes: number;
  initialDownvotes: number;
  initialUserVote: number | null;
  size?: 'sm' | 'default';
  orientation?: 'vertical' | 'horizontal';
}

export function VoteButtons({
  targetType,
  targetId,
  initialUpvotes,
  initialDownvotes,
  initialUserVote,
  size = 'default',
  orientation = 'vertical',
}: VoteButtonsProps) {
  const { score, userVote, isLoading, upvote, downvote } = useVote({
    targetType,
    targetId,
    initialUpvotes,
    initialDownvotes,
    initialUserVote,
  });

  const iconSize = size === 'sm' ? 16 : 20;
  const buttonSize = size === 'sm' ? 'h-6 w-6' : 'h-8 w-8';

  return (
    <div
      className={cn(
        'flex items-center gap-1',
        orientation === 'vertical' ? 'flex-col' : 'flex-row'
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          buttonSize,
          'rounded-full',
          userVote === 1
            ? 'text-orange-500 hover:text-orange-600 bg-orange-500/10'
            : 'text-muted-foreground hover:text-foreground'
        )}
        onClick={upvote}
        disabled={isLoading}
        aria-label="Upvote"
      >
        <ChevronUp size={iconSize} strokeWidth={2.5} />
      </Button>

      <span
        className={cn(
          'font-semibold tabular-nums',
          size === 'sm' ? 'text-sm' : 'text-base',
          score > 0 && 'text-orange-500',
          score < 0 && 'text-blue-500'
        )}
      >
        {score}
      </span>

      <Button
        variant="ghost"
        size="icon"
        className={cn(
          buttonSize,
          'rounded-full',
          userVote === -1
            ? 'text-blue-500 hover:text-blue-600 bg-blue-500/10'
            : 'text-muted-foreground hover:text-foreground'
        )}
        onClick={downvote}
        disabled={isLoading}
        aria-label="Downvote"
      >
        <ChevronDown size={iconSize} strokeWidth={2.5} />
      </Button>
    </div>
  );
}
