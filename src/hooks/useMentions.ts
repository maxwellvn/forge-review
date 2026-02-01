'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { extractMentionTrigger } from '@/lib/mentions';

interface MentionResult {
  type: 'user' | 'app';
  id: string;
  name: string;
  image?: string;
  username?: string;
}

interface UseMentionsReturn {
  results: MentionResult[];
  isLoading: boolean;
  isOpen: boolean;
  selectedIndex: number;
  mentionType: 'user' | 'app' | null;
  handleInput: (text: string, cursorPosition: number) => void;
  handleKeyDown: (e: React.KeyboardEvent) => boolean;
  selectMention: (mention: MentionResult) => string;
  close: () => void;
}

export function useMentions(
  text: string,
  cursorPosition: number
): UseMentionsReturn {
  const [results, setResults] = useState<MentionResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionType, setMentionType] = useState<'user' | 'app' | null>(null);
  const [query, setQuery] = useState('');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const search = useCallback(async (q: string, type: 'user' | 'app') => {
    if (q.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setIsOpen(true); // Show dropdown while loading
    try {
      const res = await fetch(
        `/api/mentions/search?q=${encodeURIComponent(q)}&type=${type}`
      );
      if (res.ok) {
        const data = await res.json();
        setResults(data.results);
        setIsOpen(data.results.length > 0);
        setSelectedIndex(0);
      } else {
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Mention search error:', error);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInput = useCallback(
    (newText: string, newCursorPosition: number) => {
      const trigger = extractMentionTrigger(newText, newCursorPosition);

      if (trigger) {
        setMentionType(trigger.type);
        setQuery(trigger.query);

        // Debounce search
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
          search(trigger.query, trigger.type);
        }, 300);
      } else {
        setIsOpen(false);
        setResults([]);
        setMentionType(null);
        setQuery('');
      }
    },
    [search]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent): boolean => {
      if (!isOpen) return false;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
          return true;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          return true;
        case 'Enter':
        case 'Tab':
          if (results[selectedIndex]) {
            e.preventDefault();
            return true;
          }
          return false;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          return true;
        default:
          return false;
      }
    },
    [isOpen, results, selectedIndex]
  );

  const selectMention = useCallback(
    (mention: MentionResult): string => {
      const prefix = mention.type === 'user' ? '@' : '#';
      const displayName = mention.name;
      // Use brackets for names with spaces to properly parse them
      const hasSpace = displayName.includes(' ');
      const mentionText = hasSpace
        ? `${prefix}[${displayName}]`
        : `${prefix}${displayName}`;

      setIsOpen(false);
      setResults([]);
      return mentionText;
    },
    []
  );

  const close = useCallback(() => {
    setIsOpen(false);
    setResults([]);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    results,
    isLoading,
    isOpen,
    selectedIndex,
    mentionType,
    handleInput,
    handleKeyDown,
    selectMention,
    close,
  };
}
