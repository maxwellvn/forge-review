'use client';

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

interface Discussion {
  _id: string;
  title: string;
  content: string;
  contentHtml: string;
  authorId: {
    _id: string;
    name: string;
    image?: string;
    username?: string;
    role?: string;
  };
  category: string;
  upvotes: number;
  downvotes: number;
  score: number;
  commentCount: number;
  viewCount: number;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  lastActivityAt: string;
}

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
  isDeleted: boolean;
  isEdited: boolean;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch');
  }
  return res.json();
};

export function useDiscussions(options?: {
  page?: number;
  limit?: number;
  sort?: string;
  category?: string;
}) {
  const { page = 1, limit = 20, sort = 'hot', category } = options || {};

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sort,
  });
  if (category) params.set('category', category);

  const { data, error, isLoading, mutate } = useSWR<{
    discussions: Discussion[];
    pagination: Pagination;
  }>(`/api/discussions?${params}`, fetcher);

  return {
    discussions: data?.discussions || [],
    pagination: data?.pagination,
    isLoading,
    error,
    mutate,
  };
}

export function useDiscussion(id: string) {
  const { data, error, isLoading, mutate } = useSWR<{
    discussion: Discussion;
    userVote: number | null;
  }>(id ? `/api/discussions/${id}` : null, fetcher);

  return {
    discussion: data?.discussion,
    userVote: data?.userVote,
    isLoading,
    error,
    mutate,
  };
}

export function useComments(discussionId: string) {
  const { data, error, isLoading, mutate } = useSWR<{
    comments: Comment[];
  }>(
    discussionId ? `/api/discussions/${discussionId}/comments` : null,
    fetcher
  );

  return {
    comments: data?.comments || [],
    isLoading,
    error,
    mutate,
  };
}

async function createDiscussion(
  url: string,
  { arg }: { arg: { title: string; content: string; category: string } }
) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to create discussion');
  }
  return res.json();
}

export function useCreateDiscussion() {
  const { trigger, isMutating, error } = useSWRMutation(
    '/api/discussions',
    createDiscussion
  );

  return {
    createDiscussion: trigger,
    isCreating: isMutating,
    error,
  };
}

async function createComment(
  url: string,
  { arg }: { arg: { content: string; parentId?: string } }
) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to create comment');
  }
  return res.json();
}

export function useCreateComment(discussionId: string) {
  const { trigger, isMutating, error } = useSWRMutation(
    `/api/discussions/${discussionId}/comments`,
    createComment
  );

  return {
    createComment: trigger,
    isCreating: isMutating,
    error,
  };
}
