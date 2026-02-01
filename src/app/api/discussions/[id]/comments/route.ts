import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Discussion from '@/models/Discussion';
import Comment from '@/models/Comment';
import User from '@/models/User';
import App from '@/models/App';
import Vote from '@/models/Vote';
import { canComment } from '@/lib/permissions';
import { parseMentions, formatContent } from '@/lib/mentions';
import { calculateHotScore } from '@/lib/scoring';
import mongoose from 'mongoose';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const MAX_DEPTH = 4;

// GET /api/discussions/[id]/comments - Get comments for discussion
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await connectDB();

    const discussion = await Discussion.findById(id);
    if (!discussion) {
      return NextResponse.json(
        { error: 'Discussion not found' },
        { status: 404 }
      );
    }

    // Fetch all comments for discussion, sorted by path for tree structure
    const comments = await Comment.find({
      discussionId: id,
      $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
    })
      .populate('authorId', 'name image username role')
      .sort({ path: 1, createdAt: 1 })
      .lean();

    // Get user's votes if logged in
    let userVotes: Record<string, number> = {};
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      const votes = await Vote.find({
        userId: session.user.id,
        targetType: 'comment',
        targetId: { $in: comments.map((c) => c._id) },
      });
      userVotes = votes.reduce(
        (acc, vote) => {
          acc[vote.targetId.toString()] = vote.value;
          return acc;
        },
        {} as Record<string, number>
      );
    }

    // Serialize comments properly
    const commentsWithVotes = comments.map((comment) => ({
      ...comment,
      _id: comment._id.toString(),
      discussionId: comment.discussionId.toString(),
      parentId: comment.parentId?.toString() || null,
      authorId: {
        ...(comment.authorId as object),
        _id: (comment.authorId as { _id: { toString(): string } })._id.toString(),
      },
      createdAt: (comment.createdAt as Date).toISOString(),
      updatedAt: (comment.updatedAt as Date)?.toISOString?.() || null,
      userVote: userVotes[comment._id.toString()] || null,
      isDeleted: comment.isDeleted || false,
      isEdited: comment.isEdited || false,
    }));

    return NextResponse.json({ comments: commentsWithVotes });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST /api/discussions/[id]/comments - Create comment
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!canComment(user.role)) {
      return NextResponse.json(
        { error: 'You do not have permission to comment' },
        { status: 403 }
      );
    }

    const discussion = await Discussion.findById(id);
    if (!discussion) {
      return NextResponse.json(
        { error: 'Discussion not found' },
        { status: 404 }
      );
    }

    if (discussion.isLocked) {
      return NextResponse.json(
        { error: 'This discussion is locked' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { content, parentId } = body;

    // Validate content
    if (!content || content.length > 5000) {
      return NextResponse.json(
        { error: 'Content is required and must be 5000 characters or less' },
        { status: 400 }
      );
    }

    // Handle parent comment for replies
    let depth = 0;
    let path = '';
    let parentComment = null;

    if (parentId) {
      parentComment = await Comment.findById(parentId);
      if (!parentComment) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 404 }
        );
      }

      if (parentComment.discussionId.toString() !== id) {
        return NextResponse.json(
          { error: 'Parent comment does not belong to this discussion' },
          { status: 400 }
        );
      }

      depth = parentComment.depth + 1;
      if (depth > MAX_DEPTH) {
        return NextResponse.json(
          { error: `Maximum nesting depth of ${MAX_DEPTH} exceeded` },
          { status: 400 }
        );
      }
    }

    // Parse mentions
    const parsedMentions = parseMentions(content);
    const mentions = await Promise.all(
      parsedMentions.map(async (mention) => {
        let refId: mongoose.Types.ObjectId | null = null;

        if (mention.type === 'user') {
          const mentionedUser = await User.findOne({
            name: { $regex: `^${mention.displayName}$`, $options: 'i' },
          });
          refId = mentionedUser?._id || null;
        } else {
          const mentionedApp = await App.findOne({ 
            title: { $regex: `^${mention.displayName}$`, $options: 'i' },
          });
          refId = mentionedApp?._id || null;
        }

        return {
          ...mention,
          refId: refId || new mongoose.Types.ObjectId(),
        };
      })
    );

    const resolvedMentions = mentions.filter(
      (m) => m.refId && !m.refId.equals(new mongoose.Types.ObjectId())
    );

    const contentHtml = formatContent(content, resolvedMentions);

    // Create comment
    const comment = await Comment.create({
      discussionId: id,
      parentId: parentId || null,
      authorId: user._id,
      content,
      contentHtml,
      mentions: resolvedMentions,
      depth,
      path: '', // Will be updated after creation
      upvotes: 0,
      downvotes: 0,
      score: 0,
      isDeleted: false,
    });

    // Generate path after creation (includes own ID)
    const newPath = parentComment
      ? `${parentComment.path}/${comment._id}`
      : `${comment._id}`;

    await Comment.findByIdAndUpdate(comment._id, { path: newPath });

    // Update discussion comment count and last activity
    const newCommentCount = discussion.commentCount + 1;
    const newHotScore = calculateHotScore(
      discussion.upvotes,
      discussion.downvotes,
      discussion.createdAt,
      newCommentCount
    );

    await Discussion.findByIdAndUpdate(id, {
      $inc: { commentCount: 1 },
      lastActivityAt: new Date(),
      hotScore: newHotScore,
    });

    // Populate and return
    const populatedComment = await Comment.findById(comment._id)
      .populate('authorId', 'name image username role')
      .lean();

    // Serialize the comment
    const serializedComment = {
      ...populatedComment,
      _id: populatedComment!._id.toString(),
      discussionId: populatedComment!.discussionId.toString(),
      parentId: populatedComment!.parentId?.toString() || null,
      authorId: {
        ...(populatedComment!.authorId as object),
        _id: (populatedComment!.authorId as { _id: { toString(): string } })._id.toString(),
      },
      path: newPath,
      createdAt: (populatedComment!.createdAt as Date).toISOString(),
      updatedAt: (populatedComment!.updatedAt as Date)?.toISOString?.() || null,
      userVote: null,
      isDeleted: false,
      isEdited: false,
    };

    return NextResponse.json({ comment: serializedComment }, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
