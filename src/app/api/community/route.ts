import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Review from '@/models/Review';
import App from '@/models/App';

export async function GET() {
  try {
    await connectDB();

    // Get stats
    const [
      totalUsers,
      totalReviewsThisMonth,
      superReviewersCount,
      avgRatingResult,
      topReviewers,
      recentReviews,
      recentApps,
    ] = await Promise.all([
      // Total users who have written at least one review
      User.countDocuments({ reviewsCount: { $gt: 0 } }),

      // Reviews this month
      Review.countDocuments({
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      }),

      // Super reviewers count
      User.countDocuments({ role: 'super_reviewer' }),

      // Average rating across all reviews
      Review.aggregate([
        { $group: { _id: null, avgRating: { $avg: '$rating' } } },
      ]),

      // Top reviewers by review count
      User.find({ reviewsCount: { $gt: 0 } })
        .select('name image role reviewsCount')
        .sort({ reviewsCount: -1 })
        .limit(10)
        .lean(),

      // Recent reviews with user and app info
      Review.find()
        .populate('authorId', 'name image')
        .populate('appId', 'title')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),

      // Recent app submissions
      App.find({ status: 'approved' })
        .populate('uploader', 'name image')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const avgRating = avgRatingResult[0]?.avgRating || 0;

    // Calculate helpful votes for top reviewers
    const topReviewersWithStats = await Promise.all(
      topReviewers.map(async (user) => {
        const helpfulVotes = await Review.aggregate([
          { $match: { authorId: user._id } },
          { $group: { _id: null, totalHelpful: { $sum: '$helpful' } } },
        ]);

        return {
          _id: user._id,
          name: user.name,
          image: user.image,
          role: user.role,
          reviews: user.reviewsCount,
          helpful: helpfulVotes[0]?.totalHelpful || 0,
        };
      })
    );

    // Format recent activity
    const recentActivity = [
      ...recentReviews.map((review: any) => ({
        _id: review._id,
        user: review.authorId?.name || 'Unknown',
        userId: review.authorId?._id?.toString(),
        userImage: review.authorId?.image,
        action: 'reviewed',
        target: review.appId?.title || 'an app',
        targetId: review.appId?._id,
        time: review.createdAt,
      })),
      ...recentApps.map((app: any) => ({
        _id: app._id,
        user: app.uploader?.name || 'Unknown',
        userId: app.uploader?._id?.toString(),
        userImage: app.uploader?.image,
        action: 'submitted',
        target: app.title,
        targetId: app._id,
        time: app.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 10);

    return NextResponse.json({
      stats: {
        totalReviewers: totalUsers,
        reviewsThisMonth: totalReviewsThisMonth,
        superReviewers: superReviewersCount,
        avgRating: Math.round(avgRating * 10) / 10,
      },
      topReviewers: topReviewersWithStats,
      recentActivity,
    });
  } catch (error) {
    console.error('Error fetching community data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch community data' },
      { status: 500 }
    );
  }
}
