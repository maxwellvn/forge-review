import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Comment from '@/models/Comment';
import Discussion from '@/models/Discussion';
import User from '@/models/User';
import App from '@/models/App';
import Vote from '@/models/Vote';
import { canEditOwn, canDeleteOwn, canDeleteAny } from '@/lib/permissions';
import { parseMentions, formatContent } from '@/lib/mentions';
import { calculateHotScore } from '@/lib/scoring';
import mongoose from 'mongoose';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/comments/[id] - Update comment
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const comment = await Comment.findById(id);
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isOwner = comment.authorId.toString() === session.user.id;
    if (!isOwner || !canEditOwn(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content || content.length > 5000) {
      return NextResponse.json(
        { error: 'Content is required and must be 5000 characters or less' },
        { status: 400 }
      );
    }

    // Re-parse mentions
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

    const updatedComment = await Comment.findByIdAndUpdate(
      id,
      {
        content,
        contentHtml,
        mentions: resolvedMentions,
        isEdited: true,
      },
      { new: true }
    ).populate('authorId', 'name image username role');

    return NextResponse.json({ comment: updatedComment });
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    );
  }
}

// DELETE /api/comments/[id] - Delete comment
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const comment = await Comment.findById(id);
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isOwner = comment.authorId.toString() === session.user.id;
    const canDelete =
      (isOwner && canDeleteOwn(user.role)) || canDeleteAny(user.role);

    if (!canDelete) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if comment has children
    const hasChildren = await Comment.exists({
      path: { $regex: `^${comment.path}/` },
    });

    if (hasChildren) {
      // Soft delete - mark as deleted but keep for tree structure
      await Comment.findByIdAndUpdate(id, {
        isDeleted: true,
        content: '[deleted]',
        contentHtml: '<span class="deleted">[deleted]</span>',
        mentions: [],
      });
    } else {
      // Hard delete
      await Comment.findByIdAndDelete(id);

      // Delete associated votes
      await Vote.deleteMany({ targetType: 'comment', targetId: id });
    }

    // Update discussion comment count
    const discussion = await Discussion.findById(comment.discussionId);
    if (discussion) {
      const newCommentCount = Math.max(0, discussion.commentCount - 1);
      const newHotScore = calculateHotScore(
        discussion.upvotes,
        discussion.downvotes,
        discussion.createdAt,
        newCommentCount
      );

      await Discussion.findByIdAndUpdate(comment.discussionId, {
        commentCount: newCommentCount,
        hotScore: newHotScore,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
