/**
 * Reddit-inspired hot score algorithm
 *
 * hotScore = sign(score) * log10(max(|score|, 1)) + (age_seconds / 45000) + engagement_bonus
 *
 * - Newer posts with positive scores rise
 * - Comments boost visibility
 * - ~12.5 hour half-life for decay
 */

const EPOCH = new Date('2024-01-01T00:00:00Z').getTime();
const DECAY_CONSTANT = 45000; // ~12.5 hours in seconds

export function calculateHotScore(
  upvotes: number,
  downvotes: number,
  createdAt: Date,
  commentCount: number = 0
): number {
  const score = upvotes - downvotes;
  const ageSeconds = (createdAt.getTime() - EPOCH) / 1000;

  // Sign and magnitude component
  const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
  const magnitude = Math.log10(Math.max(Math.abs(score), 1));

  // Time component (higher = newer)
  const timeComponent = ageSeconds / DECAY_CONSTANT;

  // Engagement bonus (comments boost visibility)
  const engagementBonus = Math.log10(Math.max(commentCount, 1)) * 0.5;

  return sign * magnitude + timeComponent + engagementBonus;
}

/**
 * Calculate controversial score
 * High engagement with balanced votes = more controversial
 */
export function calculateControversialScore(
  upvotes: number,
  downvotes: number
): number {
  const total = upvotes + downvotes;
  if (total === 0) return 0;

  // Balance factor: 1 when perfectly balanced, 0 when all one way
  const balance = Math.min(upvotes, downvotes) / Math.max(upvotes, downvotes, 1);

  // Controversial = high engagement * high balance
  return total * balance;
}

/**
 * Get sort field and order for different sorting options
 */
export function getSortConfig(sortBy: string): { field: string; order: 1 | -1 } {
  switch (sortBy) {
    case 'hot':
      return { field: 'hotScore', order: -1 };
    case 'top':
      return { field: 'score', order: -1 };
    case 'new':
      return { field: 'createdAt', order: -1 };
    case 'controversial':
      return { field: 'controversialScore', order: -1 };
    default:
      return { field: 'hotScore', order: -1 };
  }
}
