'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Flame, TrendingUp, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const sortOptions = [
  { value: 'hot', label: 'Hot', icon: Flame },
  { value: 'top', label: 'Top', icon: TrendingUp },
  { value: 'new', label: 'New', icon: Clock },
  { value: 'controversial', label: 'Controversial', icon: Zap },
];

const categoryOptions = [
  { value: 'all', label: 'All Categories' },
  { value: 'general', label: 'General' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'bug_report', label: 'Bug Report' },
  { value: 'feature_request', label: 'Feature Request' },
  { value: 'showcase', label: 'Showcase' },
  { value: 'question', label: 'Question' },
];

interface DiscussionFiltersProps {
  onSortChange?: (sort: string) => void;
  onCategoryChange?: (category: string) => void;
}

export function DiscussionFilters({
  onSortChange,
  onCategoryChange,
}: DiscussionFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get('sort') || 'hot';
  const currentCategory = searchParams.get('category') || 'all';

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset to page 1 when filters change
    params.delete('page');
    router.push(`?${params.toString()}`);
  };

  const handleSortChange = (value: string) => {
    updateParams('sort', value);
    onSortChange?.(value);
  };

  const handleCategoryChange = (value: string) => {
    updateParams('category', value);
    onCategoryChange?.(value);
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Sort buttons - scrollable on mobile */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-lg overflow-x-auto">
        {sortOptions.map(({ value, label, icon: Icon }) => (
          <Button
            key={value}
            variant="ghost"
            size="sm"
            className={cn(
              'h-8 gap-1.5 flex-shrink-0 px-2 sm:px-3',
              currentSort === value
                ? 'bg-background shadow-sm'
                : 'hover:bg-background/50'
            )}
            onClick={() => handleSortChange(value)}
          >
            <Icon size={14} />
            <span className="text-xs sm:text-sm">{label}</span>
          </Button>
        ))}
      </div>

      {/* Category filter */}
      <Select value={currentCategory} onValueChange={handleCategoryChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          {categoryOptions.map(({ value, label }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
