import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Review from '@/models/Review';
import App from '@/models/App';
import User from '@/models/User';
import { redis } from '@/lib/redis';
import { updateAppPulseScore } from '@/lib/pulseScore';
import { z } from 'zod';

const createReviewSchema = z.object({
  appId: z.string(),
  content: z.string().min(10).max(5000),
  rating: z.number().min(1).max(5),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createReviewSchema.parse(body);

    await connectDB();

    const app = await App.findById(validatedData.appId);
    if (!app) {
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404 }
      );
    }

    const author = await User.findById(session.user.id);
    const isSuperReview = author?.role === 'super_reviewer';

    const review = await Review.create({
      ...validatedData,
      authorId: session.user.id,
      isSuperReview,
    });

    await User.findByIdAndUpdate(session.user.id, {
      $inc: { reviewsCount: 1 },
    });

    const reviews = await Review.find({ appId: validatedData.appId });
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    await App.findByIdAndUpdate(validatedData.appId, {
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: reviews.length,
    });

    // Clear app cache so updated stats are reflected
    await redis.del(`app:metadata:${validatedData.appId}`);

    // Update pulse score
    await updateAppPulseScore(validatedData.appId);

    await review.populate('authorId', 'name image role');

    return NextResponse.json(
      { review, message: 'Review submitted successfully' },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: (error as z.ZodError).issues },
        { status: 400 }
      );
    }
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');

    if (!appId) {
      return NextResponse.json(
        { error: 'App ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const skip = (page - 1) * limit;

    const reviews = await Review.find({ appId })
      .populate('authorId', 'name image role isVerified')
      .sort({ isSuperReview: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Review.countDocuments({ appId });

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}