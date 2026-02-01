'use client';

import { useSearchParams } from 'next/navigation';
import { useDiscussions } from '@/hooks/useDiscussion';
import { DiscussionCard } from './DiscussionCard';
import { DiscussionFilters } from './DiscussionFilters';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

interface DiscussionListProps {
  showFilters?: boolean;
  showCreateButton?: boolean;
}

export function DiscussionList({
  showFilters = true,
  showCreateButton = true,
}: DiscussionListProps) {
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1');
  const sort = searchParams.get('sort') || 'hot';
  const category = searchParams.get('category') || undefined;

  const { discussions, pagination, isLoading, error } = useDiscussions({
    page,
    sort,
    category,
  });

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load discussions</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      {(showFilters || showCreateButton) && (
        <div className="flex flex-col gap-3 sm:gap-4">
          {showCreateButton && (
            <Link href="/community/discussions/new" className="sm:self-end sm:order-2">
              <Button className="w-full sm:w-auto">New Discussion</Button>
            </Link>
          )}
          {showFilters && <DiscussionFilters />}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Discussion list */}
      {!isLoading && discussions.length === 0 && (
        <div className="text-center py-12 border rounded-lg bg-card">
          <p className="text-muted-foreground">No discussions yet</p>
          {showCreateButton && (
            <Link href="/community/discussions/new">
              <Button variant="outline" className="mt-4">
                Start the first discussion
              </Button>
            </Link>
          )}
        </div>
      )}

      {!isLoading && discussions.length > 0 && (
        <div className="space-y-3">
          {discussions.map((discussion) => (
            <DiscussionCard
              key={discussion._id}
              discussion={discussion}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-1 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            asChild
            className="text-xs sm:text-sm px-2 sm:px-4"
          >
            <Link
              href={`?${new URLSearchParams({
                ...Object.fromEntries(searchParams),
                page: String(page - 1),
              })}`}
            >
              Prev
            </Link>
          </Button>

          <span className="flex items-center px-2 sm:px-4 text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
            {page} / {pagination.totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={page >= pagination.totalPages}
            asChild
            className="text-xs sm:text-sm px-2 sm:px-4"
          >
            <Link
              href={`?${new URLSearchParams({
                ...Object.fromEntries(searchParams),
                page: String(page + 1),
              })}`}
            >
              Next
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
