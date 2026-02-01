import useSWR from 'swr';

interface Category {
  _id: string;
  name: string;
  slug: string;
  type: 'discussion' | 'app' | 'review';
  color: string;
  icon?: string;
  description?: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useCategories(type?: 'discussion' | 'app' | 'review') {
  const url = type ? `/api/categories?type=${type}` : '/api/categories';

  const { data, error, isLoading, mutate } = useSWR<{ categories: Category[] }>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );

  return {
    categories: data?.categories || [],
    isLoading,
    error,
    mutate,
  };
}

// Color utility functions
export const categoryColorClasses: Record<string, string> = {
  gray: 'bg-gray-500/10 text-gray-500',
  red: 'bg-red-500/10 text-red-500',
  orange: 'bg-orange-500/10 text-orange-500',
  yellow: 'bg-yellow-500/10 text-yellow-600',
  green: 'bg-green-500/10 text-green-500',
  blue: 'bg-blue-500/10 text-blue-500',
  purple: 'bg-purple-500/10 text-purple-500',
  pink: 'bg-pink-500/10 text-pink-500',
};

export function getCategoryColorClass(color: string): string {
  return categoryColorClasses[color] || categoryColorClasses.gray;
}
