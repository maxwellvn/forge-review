import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Discussion from '@/models/Discussion';
import User from '@/models/User';
import App from '@/models/App';
import Vote from '@/models/Vote';
import { canModerate, canEditOwn, canDeleteOwn, canDeleteAny } from '@/lib/permissions';
import { parseMentions, formatContent } from '@/lib/mentions';
import mongoose from 'mongoose';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/discussions/[id] - Get single discussion
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await connectDB();

    const discussion = await Discussion.findById(id)
      .populate('authorId', 'name image username role')
      .lean();

    if (!discussion) {
      return NextResponse.json(
        { error: 'Discussion not found' },
        { status: 404 }
      );
    }

    if (discussion.isHidden) {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: 'Discussion not found' },
          { status: 404 }
        );
      }

      const user = await User.findById(session.user.id);
      if (!user || !canModerate(user.role)) {
        return NextResponse.json(
          { error: 'Discussion not found' },
          { status: 404 }
        );
      }
    }

    // Increment view count
    await Discussion.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

    // Get user's vote if logged in
    let userVote = null;
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      const vote = await Vote.findOne({
        userId: session.user.id,
        targetType: 'discussion',
        targetId: id,
      });
      userVote = vote?.value || null;
    }

    return NextResponse.json({ discussion, userVote });
  } catch (error) {
    console.error('Error fetching discussion:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discussion' },
      { status: 500 }
    );
  }
}

// PATCH /api/discussions/[id] - Update discussion
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const discussion = await Discussion.findById(id);
    if (!discussion) {
      return NextResponse.json(
        { error: 'Discussion not found' },
        { status: 404 }
      );
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isOwner = discussion.authorId.toString() === session.user.id;
    const isModerator = canModerate(user.role);

    if (!isOwner && !isModerator) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    // Owner can update title and content
    if (isOwner && canEditOwn(user.role)) {
      if (body.title !== undefined) {
        if (body.title.length > 200) {
          return NextResponse.json(
            { error: 'Title must be 200 characters or less' },
            { status: 400 }
          );
        }
        updates.title = body.title;
      }

      if (body.content !== undefined) {
        if (body.content.length > 10000) {
          return NextResponse.json(
            { error: 'Content must be 10000 characters or less' },
            { status: 400 }
          );
        }
        updates.content = body.content;

        // Re-parse mentions
        const parsedMentions = parseMentions(body.content);
        const mentions = await Promise.all(
          parsedMentions.map(async (mention) => {
            let refId: mongoose.Types.ObjectId | null = null;

            if (mention.type === 'user') {
              const mentionedUser = await User.findOne({
                $or: [
                  { username: mention.displayName },
                  { name: mention.displayName },
                ],
              });
              refId = mentionedUser?._id || null;
            } else {
              const mentionedApp = await App.findOne({
                name: mention.displayName,
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

        updates.mentions = resolvedMentions;
        updates.contentHtml = formatContent(body.content, resolvedMentions);
      }
    }

    // Moderators can update moderation flags
    if (isModerator) {
      if (body.isPinned !== undefined) updates.isPinned = body.isPinned;
      if (body.isLocked !== undefined) updates.isLocked = body.isLocked;
      if (body.isHidden !== undefined) updates.isHidden = body.isHidden;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid updates' }, { status: 400 });
    }

    const updatedDiscussion = await Discussion.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    ).populate('authorId', 'name image username role');

    return NextResponse.json({ discussion: updatedDiscussion });
  } catch (error) {
    console.error('Error updating discussion:', error);
    return NextResponse.json(
      { error: 'Failed to update discussion' },
      { status: 500 }
    );
  }
}

// DELETE /api/discussions/[id] - Delete discussion
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const discussion = await Discussion.findById(id);
    if (!discussion) {
      return NextResponse.json(
        { error: 'Discussion not found' },
        { status: 404 }
      );
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isOwner = discussion.authorId.toString() === session.user.id;
    const canDelete = (isOwner && canDeleteOwn(user.role)) || canDeleteAny(user.role);

    if (!canDelete) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await Discussion.findByIdAndDelete(id);

    // Also delete associated votes
    await Vote.deleteMany({ targetType: 'discussion', targetId: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting discussion:', error);
    return NextResponse.json(
      { error: 'Failed to delete discussion' },
      { status: 500 }
    );
  }
}
