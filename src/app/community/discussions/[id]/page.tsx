import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Discussion from '@/models/Discussion';
import Comment from '@/models/Comment';
import Vote from '@/models/Vote';
import User from '@/models/User';
import { canModerate } from '@/lib/permissions';
import { DiscussionDetail } from '@/components/discussions/DiscussionDetail';
import { CommentSection } from './CommentSection';
import { Breadcrumb } from '@/components/ui/breadcrumb';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  await connectDB();
  const discussion = await Discussion.findById(id).lean();

  if (!discussion) {
    return { title: 'Discussion Not Found' };
  }

  return {
    title: `${discussion.title} | Discussion`,
    description: discussion.content.slice(0, 160),
  };
}

export default async function DiscussionPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  await connectDB();

  const discussion = await Discussion.findById(id)
    .populate('authorId', 'name image username role')
    .lean();

  if (!discussion) {
    notFound();
  }

  // Check if discussion is hidden
  if (discussion.isHidden) {
    if (!session?.user?.id) {
      notFound();
    }
    const user = await User.findById(session.user.id);
    if (!user || !canModerate(user.role)) {
      notFound();
    }
  }

  // Increment view count (fire and forget)
  Discussion.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }).exec();

  // Get user's vote on the discussion
  let userVote = null;
  if (session?.user?.id) {
    const vote = await Vote.findOne({
      userId: session.user.id,
      targetType: 'discussion',
      targetId: id,
    }).lean();
    userVote = vote?.value || null;
  }

  // Get comments
  const comments = await Comment.find({
    discussionId: id,
    $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
  })
    .populate('authorId', 'name image username role')
    .sort({ path: 1, createdAt: 1 })
    .lean();

  // Get user's votes on comments
  let commentVotes: Record<string, number> = {};
  if (session?.user?.id) {
    const votes = await Vote.find({
      userId: session.user.id,
      targetType: 'comment',
      targetId: { $in: comments.map((c) => c._id) },
    }).lean();
    commentVotes = votes.reduce(
      (acc, vote) => {
        acc[vote.targetId.toString()] = vote.value;
        return acc;
      },
      {} as Record<string, number>
    );
  }

  const commentsWithVotes = comments.map((comment) => ({
    ...comment,
    _id: comment._id.toString(),
    discussionId: comment.discussionId.toString(),
    parentId: comment.parentId?.toString() || null,
    authorId: {
      ...comment.authorId,
      _id: (comment.authorId as { _id: { toString(): string } })._id.toString(),
    },
    userVote: commentVotes[comment._id.toString()] || null,
    createdAt: (comment.createdAt as Date).toISOString(),
    updatedAt: (comment.updatedAt as Date)?.toISOString?.() || null,
    isDeleted: comment.isDeleted || false,
    isEdited: comment.isEdited || false,
  }));

  // Serialize discussion for client
  const serializedDiscussion = {
    ...discussion,
    _id: discussion._id.toString(),
    authorId: {
      ...discussion.authorId,
      _id: (discussion.authorId as { _id: { toString(): string } })._id.toString(),
    },
    createdAt: discussion.createdAt.toISOString(),
    lastActivityAt: discussion.lastActivityAt.toISOString(),
  };

  return (
    <div className="container max-w-4xl py-8">
      <Breadcrumb
        items={[
          { label: 'Community', href: '/community' },
          { label: 'Discussions', href: '/community/discussions' },
          { label: serializedDiscussion.title },
        ]}
      />

      <DiscussionDetail
        discussion={serializedDiscussion}
        userVote={userVote}
      />

      <div className="mt-8">
        <CommentSection
          discussionId={id}
          initialComments={commentsWithVotes}
          isLocked={discussion.isLocked}
        />
      </div>
    </div>
  );
}
