import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import App from '@/models/App';
import User from '@/models/User';
import Review from '@/models/Review';
import { redis } from '@/lib/redis';

export async function GET() {
  try {
    await connectDB();

    const [
      totalApps,
      verifiedApps,
      totalReviewers,
      totalReviews,
    ] = await Promise.all([
      // Total approved apps
      App.countDocuments({ status: 'approved' }),

      // Verified apps
      App.countDocuments({ status: 'approved', isVerified: true }),

      // Active reviewers (users with at least 1 review)
      User.countDocuments({ reviewsCount: { $gt: 0 } }),

      // Total reviews
      Review.countDocuments(),
    ]);

    // Get total views from Redis (sum of all app views)
    const viewKeys = await redis.keys('app:views:*');
    // Filter out the :ips keys
    const appViewKeys = viewKeys.filter(k => !k.includes(':ips'));

    let totalViews = 0;
    if (appViewKeys.length > 0) {
      const viewCounts = await redis.mget(...appViewKeys);
      totalViews = viewCounts.reduce((sum, v) => sum + (parseInt(v || '0') || 0), 0);
    }

    return NextResponse.json({
      totalApps,
      verifiedApps,
      totalReviewers,
      totalReviews,
      totalViews,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
