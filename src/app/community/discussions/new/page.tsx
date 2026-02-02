import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { canCreateDiscussion } from '@/lib/permissions';
import { DiscussionForm } from '@/components/discussions/DiscussionForm';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'New Discussion | Community',
  description: 'Start a new discussion',
};

export default async function NewDiscussionPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/community/discussions/new');
  }

  await connectDB();
  const user = await User.findById(session.user.id);

  if (!user || !canCreateDiscussion(user.role)) {
    return (
      <div className="container max-w-2xl py-4 px-3 sm:py-8 sm:px-4">
        <Breadcrumb
          items={[
            { label: 'Community', href: '/community' },
            { label: 'Discussions', href: '/community/discussions' },
            { label: 'New' },
          ]}
        />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            You need to be a verified reviewer to create discussions.{' '}
            <Link href="/profile" className="underline">
              View your profile
            </Link>{' '}
            to learn more about becoming verified.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-4 px-3 sm:py-8 sm:px-4">
      <Breadcrumb
        items={[
          { label: 'Community', href: '/community' },
          { label: 'Discussions', href: '/community/discussions' },
          { label: 'New Discussion' },
        ]}
      />

      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">New Discussion</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Start a conversation with the community
        </p>
      </div>

      <div className="border rounded-lg p-4 sm:p-6 bg-card">
        <DiscussionForm />
      </div>
    </div>
  );
}
