import { UserRole } from '@/models/User';

// Roles that can create discussions
const DISCUSSION_CREATOR_ROLES: UserRole[] = [
  'verified_reviewer',
  'super_reviewer',
  'moderator',
  'admin',
];

// Roles that can moderate (pin, lock, hide)
const MODERATOR_ROLES: UserRole[] = ['moderator', 'admin'];

export function canCreateDiscussion(role: UserRole): boolean {
  return DISCUSSION_CREATOR_ROLES.includes(role);
}

export function canModerate(role: UserRole): boolean {
  return MODERATOR_ROLES.includes(role);
}

export function canComment(role: UserRole): boolean {
  // All authenticated users can comment
  return true;
}

export function canVote(role: UserRole): boolean {
  // All authenticated users can vote
  return true;
}

export function canEditOwn(role: UserRole): boolean {
  // All authenticated users can edit their own content
  return true;
}

export function canDeleteOwn(role: UserRole): boolean {
  // All authenticated users can delete their own content
  return true;
}

export function canDeleteAny(role: UserRole): boolean {
  // Only moderators and admins can delete any content
  return MODERATOR_ROLES.includes(role);
}
