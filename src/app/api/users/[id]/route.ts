import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import App from '@/models/App';
import Review from '@/models/Review';
import Discussion from '@/models/Discussion';
import mongoose from 'mongoose';

// GET /api/users/[id] - Get public user profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(id)
      .select('name image role bio reviewsCount helpfulVotes joinedAt isVerified badges isBanned')
      .lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.isBanned) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch user's submitted apps (only approved ones)
    const apps = await App.find({
      uploader: id,
      status: 'approved'
    })
      .select('title shortDescription iconUrl category averageRating totalReviews createdAt')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Fetch user's recent reviews
    const reviews = await Review.find({ userId: id })
      .populate('appId', 'title iconUrl category')
      .select('content rating helpful createdAt appId')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Fetch user's recent discussions
    const discussions = await Discussion.find({
      authorId: id,
      isHidden: false
    })
      .select('title category score commentCount createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Get counts
    const [appsCount, discussionsCount] = await Promise.all([
      App.countDocuments({ uploader: id, status: 'approved' }),
      Discussion.countDocuments({ authorId: id, isHidden: false }),
    ]);

    return NextResponse.json({
      user: {
        _id: user._id,
        name: user.name,
        image: user.image,
        role: user.role,
        bio: user.bio,
        reviewsCount: user.reviewsCount,
        helpfulVotes: user.helpfulVotes,
        joinedAt: user.joinedAt,
        isVerified: user.isVerified,
        badges: user.badges,
        appsCount,
        discussionsCount,
      },
      apps,
      reviews,
      discussions,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}
