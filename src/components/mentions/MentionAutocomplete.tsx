'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import { User, AppWindow } from 'lucide-react';

interface MentionResult {
  type: 'user' | 'app';
  id: string;
  name: string;
  image?: string;
  username?: string;
}

interface MentionAutocompleteProps {
  results: MentionResult[];
  selectedIndex: number;
  onSelect: (mention: MentionResult) => void;
  isLoading?: boolean;
}

export function MentionAutocomplete({
  results,
  selectedIndex,
  onSelect,
  isLoading,
}: MentionAutocompleteProps) {
  if (results.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div className="absolute z-50 w-64 bg-popover border rounded-lg shadow-lg overflow-hidden">
      {isLoading ? (
        <div className="p-2 text-sm text-muted-foreground">Searching...</div>
      ) : (
        <ul className="py-1">
          {results.map((result, index) => (
            <li key={`${result.type}-${result.id}`}>
              <button
                type="button"
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-accent transition-colors',
                  index === selectedIndex && 'bg-accent'
                )}
                onClick={() => onSelect(result)}
              >
                {result.image ? (
                  <Image
                    src={result.image}
                    alt={result.name}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                ) : result.type === 'user' ? (
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                    <User size={14} className="text-muted-foreground" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded bg-muted flex items-center justify-center">
                    <AppWindow size={14} className="text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {result.name}
                  </div>
                  {result.username && (
                    <div className="text-xs text-muted-foreground truncate">
                      @{result.username}
                    </div>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {result.type === 'user' ? '@' : '#'}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
