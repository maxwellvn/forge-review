'use client';

import { useMemo } from 'react';
import { CommentCard } from './CommentCard';
import { cn } from '@/lib/utils';

interface Comment {
  _id: string;
  discussionId: string;
  parentId: string | null;
  authorId: {
    _id: string;
    name: string;
    image?: string;
    username?: string;
    role?: string;
  };
  content: string;
  contentHtml: string;
  depth: number;
  path: string;
  upvotes: number;
  downvotes: number;
  score: number;
  userVote: number | null;
  isDeleted?: boolean;
  isEdited?: boolean;
  createdAt: string;
}

interface CommentThreadProps {
  comments: Comment[];
  discussionLocked?: boolean;
  onRefresh?: () => void;
}

interface CommentNode extends Comment {
  children: CommentNode[];
}

function buildTree(comments: Comment[]): CommentNode[] {
  const map = new Map<string, CommentNode>();
  const roots: CommentNode[] = [];

  // First pass: create nodes
  comments.forEach((comment) => {
    map.set(comment._id, { ...comment, children: [] });
  });

  // Second pass: build tree
  comments.forEach((comment) => {
    const node = map.get(comment._id)!;
    if (comment.parentId && map.has(comment.parentId)) {
      map.get(comment.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  // Sort children by score (descending) then by date (ascending)
  const sortChildren = (nodes: CommentNode[]) => {
    nodes.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
    nodes.forEach((node) => sortChildren(node.children));
  };

  sortChildren(roots);
  return roots;
}

function CommentNodeComponent({
  node,
  discussionLocked,
  onRefresh,
}: {
  node: CommentNode;
  discussionLocked?: boolean;
  onRefresh?: () => void;
}) {
  return (
    <div>
      <CommentCard
        comment={node}
        discussionLocked={discussionLocked}
        onReplyAdded={onRefresh}
        onDeleted={onRefresh}
      />
      {node.children.length > 0 && (
        <div
          className={cn(
            'ml-4 pl-4 border-l-2 border-muted',
            node.depth >= 3 && 'ml-2 pl-2'
          )}
        >
          {node.children.map((child) => (
            <CommentNodeComponent
              key={child._id}
              node={child}
              discussionLocked={discussionLocked}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentThread({
  comments,
  discussionLocked,
  onRefresh,
}: CommentThreadProps) {
  const tree = useMemo(() => buildTree(comments), [comments]);

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No comments yet. Be the first to share your thoughts!
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {tree.map((node) => (
        <CommentNodeComponent
          key={node._id}
          node={node}
          discussionLocked={discussionLocked}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  );
}
