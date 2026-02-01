import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Discussion from '@/models/Discussion';
import Comment from '@/models/Comment';
import Vote from '@/models/Vote';
import User from '@/models/User';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/admin/discussions/[id] - Get single discussion
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const discussion = await Discussion.findById(id)
      .populate('authorId', 'name email image')
      .lean();

    if (!discussion) {
      return NextResponse.json(
        { error: 'Discussion not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ discussion });
  } catch (error) {
    console.error('Error fetching discussion:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discussion' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/discussions/[id] - Update discussion (moderate)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const discussion = await Discussion.findById(id);
    if (!discussion) {
      return NextResponse.json(
        { error: 'Discussion not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    // Moderation actions
    if (typeof body.isPinned === 'boolean') updates.isPinned = body.isPinned;
    if (typeof body.isLocked === 'boolean') updates.isLocked = body.isLocked;
    if (typeof body.isHidden === 'boolean') updates.isHidden = body.isHidden;

    // Admin-only: category change
    if (body.category && user.role === 'admin') {
      const validCategories = [
        'general',
        'feedback',
        'bug_report',
        'feature_request',
        'showcase',
        'question',
      ];
      if (validCategories.includes(body.category)) {
        updates.category = body.category;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid updates' }, { status: 400 });
    }

    const updatedDiscussion = await Discussion.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    ).populate('authorId', 'name email image');

    return NextResponse.json({ discussion: updatedDiscussion });
  } catch (error) {
    console.error('Error updating discussion:', error);
    return NextResponse.json(
      { error: 'Failed to update discussion' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/discussions/[id] - Delete discussion
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const discussion = await Discussion.findById(id);
    if (!discussion) {
      return NextResponse.json(
        { error: 'Discussion not found' },
        { status: 404 }
      );
    }

    // Delete all comments
    const comments = await Comment.find({ discussionId: id });
    const commentIds = comments.map((c) => c._id);

    // Delete votes on comments
    await Vote.deleteMany({
      targetType: 'comment',
      targetId: { $in: commentIds },
    });

    // Delete comments
    await Comment.deleteMany({ discussionId: id });

    // Delete votes on discussion
    await Vote.deleteMany({
      targetType: 'discussion',
      targetId: id,
    });

    // Delete discussion
    await Discussion.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting discussion:', error);
    return NextResponse.json(
      { error: 'Failed to delete discussion' },
      { status: 500 }
    );
  }
}
