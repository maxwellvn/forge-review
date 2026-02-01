import { Suspense } from 'react';
import { DiscussionList } from '@/components/discussions/DiscussionList';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Discussions | Community',
  description: 'Join the community discussion',
};

export default function DiscussionsPage() {
  return (
    <div className="container max-w-4xl py-4 px-3 sm:py-8 sm:px-4">
      <Breadcrumb
        items={[
          { label: 'Community', href: '/community' },
          { label: 'Discussions' },
        ]}
      />

      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Discussions</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Share ideas, ask questions, and connect with the community
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <DiscussionList />
      </Suspense>
    </div>
  );
}
