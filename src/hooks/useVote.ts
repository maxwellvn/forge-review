'use client';

import { useState, useCallback } from 'react';

interface UseVoteOptions {
  initialUpvotes: number;
  initialDownvotes: number;
  initialUserVote: number | null;
  targetType: 'discussion' | 'comment';
  targetId: string;
}

interface UseVoteReturn {
  upvotes: number;
  downvotes: number;
  score: number;
  userVote: number | null;
  isLoading: boolean;
  vote: (value: 1 | -1 | 0) => Promise<void>;
  upvote: () => Promise<void>;
  downvote: () => Promise<void>;
  removeVote: () => Promise<void>;
}

export function useVote({
  initialUpvotes,
  initialDownvotes,
  initialUserVote,
  targetType,
  targetId,
}: UseVoteOptions): UseVoteReturn {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState<number | null>(initialUserVote);
  const [isLoading, setIsLoading] = useState(false);

  const vote = useCallback(
    async (value: 1 | -1 | 0) => {
      // Optimistic update
      const prevUpvotes = upvotes;
      const prevDownvotes = downvotes;
      const prevUserVote = userVote;

      let newUpvotes = upvotes;
      let newDownvotes = downvotes;

      // Calculate optimistic new values
      if (value === 0) {
        if (userVote === 1) newUpvotes--;
        else if (userVote === -1) newDownvotes--;
      } else if (userVote === value) {
        // Same vote - remove it
        if (value === 1) newUpvotes--;
        else newDownvotes--;
        value = 0;
      } else {
        if (userVote === 1) newUpvotes--;
        else if (userVote === -1) newDownvotes--;
        if (value === 1) newUpvotes++;
        else if (value === -1) newDownvotes++;
      }

      setUpvotes(newUpvotes);
      setDownvotes(newDownvotes);
      setUserVote(value === 0 ? null : value);
      setIsLoading(true);

      try {
        const endpoint =
          targetType === 'discussion'
            ? `/api/discussions/${targetId}/vote`
            : `/api/comments/${targetId}/vote`;

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value }),
        });

        if (!res.ok) {
          throw new Error('Failed to vote');
        }

        const data = await res.json();
        setUpvotes(data.upvotes);
        setDownvotes(data.downvotes);
        setUserVote(data.userVote);
      } catch (error) {
        // Rollback on error
        setUpvotes(prevUpvotes);
        setDownvotes(prevDownvotes);
        setUserVote(prevUserVote);
        console.error('Vote error:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [upvotes, downvotes, userVote, targetType, targetId]
  );

  const upvote = useCallback(() => {
    return vote(userVote === 1 ? 0 : 1);
  }, [vote, userVote]);

  const downvote = useCallback(() => {
    return vote(userVote === -1 ? 0 : -1);
  }, [vote, userVote]);

  const removeVote = useCallback(() => {
    return vote(0);
  }, [vote]);

  return {
    upvotes,
    downvotes,
    score: upvotes - downvotes,
    userVote,
    isLoading,
    vote,
    upvote,
    downvote,
    removeVote,
  };
}
