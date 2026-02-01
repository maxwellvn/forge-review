import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import App from '@/models/App';
import Review from '@/models/Review';
import { requireAdmin } from '@/lib/admin';

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    await connectDB();

    // Get counts
    const [
      totalUsers,
      totalApps,
      totalReviews,
      pendingApps,
      approvedApps,
      rejectedApps,
      bannedUsers,
      adminUsers,
      moderatorUsers,
      verifiedReviewers,
      superReviewers,
    ] = await Promise.all([
      User.countDocuments(),
      App.countDocuments(),
      Review.countDocuments(),
      App.countDocuments({ status: 'pending' }),
      App.countDocuments({ status: 'approved' }),
      App.countDocuments({ status: 'rejected' }),
      User.countDocuments({ isBanned: true }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'moderator' }),
      User.countDocuments({ role: 'verified_reviewer' }),
      User.countDocuments({ role: 'super_reviewer' }),
    ]);

    // Get recent activity
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email image role createdAt');

    const recentApps = await App.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status category createdAt')
      .populate('uploader', 'name email');

    const recentReviews = await Review.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('authorId', 'name email')
      .populate('appId', 'title');

    return NextResponse.json({
      stats: {
        users: {
          total: totalUsers,
          banned: bannedUsers,
          admins: adminUsers,
          moderators: moderatorUsers,
          verifiedReviewers,
          superReviewers,
        },
        apps: {
          total: totalApps,
          pending: pendingApps,
          approved: approvedApps,
          rejected: rejectedApps,
        },
        reviews: {
          total: totalReviews,
        },
      },
      recent: {
        users: recentUsers,
        apps: recentApps,
        reviews: recentReviews,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
