import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Review from '@/models/Review';
import { updateAppPulseScore } from '@/lib/pulseScore';
import mongoose from 'mongoose';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Please sign in to vote' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const type = body.type;

    if (type !== 'helpful' && type !== 'unhelpful') {
      return NextResponse.json(
        { error: 'Invalid vote type' },
        { status: 400 }
      );
    }

    await connectDB();

    const userId = session.user.id;

    // Find review and check existing vote
    const review = await Review.findById(id);

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Initialize votes array if needed
    if (!review.votes) {
      review.votes = [];
    }

    const existingVoteIndex = review.votes.findIndex(
      (v: any) => v.userId?.toString() === userId
    );

    if (existingVoteIndex > -1) {
      const existingType = review.votes[existingVoteIndex].type;

      if (existingType === type) {
        // Remove vote
        review.votes.splice(existingVoteIndex, 1);
        review[type] = Math.max(0, (review[type] || 0) - 1);
      } else {
        // Switch vote
        review.votes[existingVoteIndex].type = type;
        review[type] = (review[type] || 0) + 1;
        review[existingType] = Math.max(0, (review[existingType] || 0) - 1);
      }
    } else {
      // Add new vote
      review.votes.push({
        userId: new mongoose.Types.ObjectId(userId),
        type
      });
      review[type] = (review[type] || 0) + 1;
    }

    await review.save();

    // Update pulse score for the app (async, don't block response)
    updateAppPulseScore(review.appId.toString()).catch(console.error);

    const userVote = review.votes.find(
      (v: any) => v.userId?.toString() === userId
    )?.type || null;

    return NextResponse.json({
      helpful: review.helpful || 0,
      unhelpful: review.unhelpful || 0,
      userVote,
    });
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json(
      { error: 'Failed to record vote' },
      { status: 500 }
    );
  }
}
