import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Review from '@/models/Review';
import App from '@/models/App';
import { requireAdminOrModerator } from '@/lib/admin';
import { redis } from '@/lib/redis';
import { updateAppPulseScore } from '@/lib/pulseScore';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminOrModerator();
  if (error) return error;

  try {
    await connectDB();
    const { id } = await params;

    const review = await Review.findById(id)
      .populate('authorId', 'name email image role')
      .populate('appId', 'title iconUrl')
      .select('-__v');

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Admin get review error:', error);
    return NextResponse.json({ error: 'Failed to fetch review' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminOrModerator();
  if (error) return error;

  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const review = await Review.findById(id);

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Update allowed fields
    const allowedFields = ['isHidden', 'isFlagged', 'content'];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        review[field] = body[field];
      }
    }

    await review.save();

    return NextResponse.json({ review, message: 'Review updated successfully' });
  } catch (error) {
    console.error('Admin update review error:', error);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminOrModerator();
  if (error) return error;

  try {
    await connectDB();
    const { id } = await params;

    const review = await Review.findById(id);

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    const appId = review.appId;
    const rating = review.rating;

    await Review.findByIdAndDelete(id);

    // Update app's average rating and total reviews
    const app = await App.findById(appId);
    if (app && app.totalReviews > 0) {
      const newTotalReviews = app.totalReviews - 1;
      if (newTotalReviews === 0) {
        app.averageRating = 0;
        app.totalReviews = 0;
      } else {
        const totalRatingSum = app.averageRating * app.totalReviews - rating;
        app.averageRating = totalRatingSum / newTotalReviews;
        app.totalReviews = newTotalReviews;
      }
      await app.save();

      // Clear app cache so updated stats are reflected
      await redis.del(`app:metadata:${appId}`);

      // Update pulse score
      await updateAppPulseScore(appId.toString());
    }

    return NextResponse.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Admin delete review error:', error);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}
