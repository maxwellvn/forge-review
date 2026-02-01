'use client';

import { useRef, useState, useCallback } from 'react';
import { useMentions } from '@/hooks/useMentions';
import { MentionAutocomplete } from './MentionAutocomplete';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minRows?: number;
  maxRows?: number;
  disabled?: boolean;
}

export function MentionInput({
  value,
  onChange,
  placeholder,
  className,
  minRows = 3,
  maxRows = 10,
  disabled,
}: MentionInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState(0);

  const {
    results,
    isLoading,
    isOpen,
    selectedIndex,
    handleInput,
    handleKeyDown: mentionKeyDown,
    selectMention,
    close,
  } = useMentions(value, cursorPosition);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      const newPosition = e.target.selectionStart || 0;
      onChange(newValue);
      setCursorPosition(newPosition);
      handleInput(newValue, newPosition);
    },
    [onChange, handleInput]
  );

  const handleSelect = useCallback(
    (mention: { type: 'user' | 'app'; id: string; name: string; image?: string; username?: string }) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      // Find the start of the mention trigger
      const textBeforeCursor = value.slice(0, cursorPosition);
      const match = textBeforeCursor.match(/(@|#)"?\w*$/);

      if (match) {
        const triggerStart = cursorPosition - match[0].length;
        const mentionText = selectMention(mention);
        const newValue =
          value.slice(0, triggerStart) +
          mentionText +
          ' ' +
          value.slice(cursorPosition);

        onChange(newValue);

        // Set cursor after the mention
        const newPosition = triggerStart + mentionText.length + 1;
        setTimeout(() => {
          textarea.setSelectionRange(newPosition, newPosition);
          textarea.focus();
        }, 0);
      }
    },
    [value, cursorPosition, onChange, selectMention]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (mentionKeyDown(e)) {
        if (e.key === 'Enter' || e.key === 'Tab') {
          if (results[selectedIndex]) {
            handleSelect(results[selectedIndex]);
          }
        }
        return;
      }
    },
    [mentionKeyDown, results, selectedIndex, handleSelect]
  );

  const handleBlur = useCallback(() => {
    // Delay closing to allow click on autocomplete
    setTimeout(close, 200);
  }, [close]);

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={cn('resize-none', className)}
        style={{
          minHeight: `${minRows * 1.5}rem`,
          maxHeight: `${maxRows * 1.5}rem`,
        }}
        disabled={disabled}
      />
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 z-50">
          <MentionAutocomplete
            results={results}
            selectedIndex={selectedIndex}
            onSelect={handleSelect}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
}
