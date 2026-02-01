import { IMention } from '@/models/Discussion';

// Match @username, @"User Name", #AppName, #"App Name"
const MENTION_REGEX = /(@|#)(?:"([^"]+)"|(\w+))/g;

export interface ParsedMention {
  type: 'user' | 'app';
  displayName: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Parse mentions from content text
 * Returns array of parsed mentions without refIds (those need to be resolved via DB lookup)
 */
export function parseMentions(content: string): ParsedMention[] {
  const mentions: ParsedMention[] = [];
  let match;

  while ((match = MENTION_REGEX.exec(content)) !== null) {
    const prefix = match[1];
    const quotedName = match[2];
    const unquotedName = match[3];
    const displayName = quotedName || unquotedName;

    mentions.push({
      type: prefix === '@' ? 'user' : 'app',
      displayName,
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  return mentions;
}

/**
 * Render content with mention links
 * Converts @username to clickable profile links and #AppName to app links
 */
export function renderMentions(content: string, mentions: IMention[]): string {
  if (!mentions || mentions.length === 0) {
    return escapeHtml(content);
  }

  // Sort mentions by startIndex in reverse order so we can replace from end to start
  const sortedMentions = [...mentions].sort((a, b) => b.startIndex - a.startIndex);

  let result = content;

  for (const mention of sortedMentions) {
    const originalText = result.slice(mention.startIndex, mention.endIndex);
    const link = mention.type === 'user'
      ? `<a href="/profile/${mention.refId}" class="mention mention-user">@${mention.displayName}</a>`
      : `<a href="/apps/${mention.refId}" class="mention mention-app">#${mention.displayName}</a>`;

    result = result.slice(0, mention.startIndex) + link + result.slice(mention.endIndex);
  }

  // Escape HTML in non-mention parts (this is simplified - in production use a proper sanitizer)
  return result;
}

/**
 * Simple HTML escape for content
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Convert newlines to <br> tags and escape HTML
 */
export function formatContent(content: string, mentions: IMention[]): string {
  let html = renderMentions(content, mentions);
  // Convert newlines to <br> tags
  html = html.replace(/\n/g, '<br>');
  return html;
}

/**
 * Extract mention trigger from text (for autocomplete)
 * Returns the search query if user is typing a mention, null otherwise
 */
export function extractMentionTrigger(
  text: string,
  cursorPosition: number
): { type: 'user' | 'app'; query: string } | null {
  // Look backwards from cursor for @ or #
  const textBeforeCursor = text.slice(0, cursorPosition);

  // Match @ or # followed by optional quote and characters, at word boundary
  const match = textBeforeCursor.match(/(?:^|[\s])(@|#)"?(\w*)$/);

  if (match) {
    const prefix = match[1];
    const query = match[2];

    // Only trigger autocomplete after 2+ characters
    if (query.length >= 2) {
      return {
        type: prefix === '@' ? 'user' : 'app',
        query,
      };
    }
  }

  return null;
}
