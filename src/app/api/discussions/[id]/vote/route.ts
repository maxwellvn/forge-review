import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Discussion from '@/models/Discussion';
import Vote from '@/models/Vote';
import User from '@/models/User';
import { canVote } from '@/lib/permissions';
import { calculateHotScore, calculateControversialScore } from '@/lib/scoring';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/discussions/[id]/vote - Vote on discussion
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

    if (!canVote(user.role)) {
      return NextResponse.json(
        { error: 'You do not have permission to vote' },
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

    const body = await request.json();
    const { value } = body;

    // Validate vote value: 1 (upvote), -1 (downvote), or 0 (remove vote)
    if (![1, -1, 0].includes(value)) {
      return NextResponse.json(
        { error: 'Invalid vote value. Must be 1, -1, or 0' },
        { status: 400 }
      );
    }

    // Find existing vote
    const existingVote = await Vote.findOne({
      userId: session.user.id,
      targetType: 'discussion',
      targetId: id,
    });

    let upvoteDelta = 0;
    let downvoteDelta = 0;

    if (value === 0) {
      // Remove vote
      if (existingVote) {
        if (existingVote.value === 1) {
          upvoteDelta = -1;
        } else {
          downvoteDelta = -1;
        }
        await Vote.findByIdAndDelete(existingVote._id);
      }
    } else if (existingVote) {
      // Update existing vote
      if (existingVote.value !== value) {
        if (existingVote.value === 1) {
          upvoteDelta = -1;
          downvoteDelta = 1;
        } else {
          upvoteDelta = 1;
          downvoteDelta = -1;
        }
        existingVote.value = value;
        await existingVote.save();
      }
      // If same vote, do nothing
    } else {
      // Create new vote
      await Vote.create({
        userId: session.user.id,
        targetType: 'discussion',
        targetId: id,
        value,
      });

      if (value === 1) {
        upvoteDelta = 1;
      } else {
        downvoteDelta = 1;
      }
    }

    // Update discussion vote counts
    const newUpvotes = discussion.upvotes + upvoteDelta;
    const newDownvotes = discussion.downvotes + downvoteDelta;
    const newScore = newUpvotes - newDownvotes;
    const newHotScore = calculateHotScore(
      newUpvotes,
      newDownvotes,
      discussion.createdAt,
      discussion.commentCount
    );
    const newControversialScore = calculateControversialScore(
      newUpvotes,
      newDownvotes
    );

    await Discussion.findByIdAndUpdate(id, {
      upvotes: newUpvotes,
      downvotes: newDownvotes,
      score: newScore,
      hotScore: newHotScore,
      controversialScore: newControversialScore,
    });

    return NextResponse.json({
      upvotes: newUpvotes,
      downvotes: newDownvotes,
      score: newScore,
      userVote: value === 0 ? null : value,
    });
  } catch (error) {
    console.error('Error voting on discussion:', error);
    return NextResponse.json(
      { error: 'Failed to vote on discussion' },
      { status: 500 }
    );
  }
}
