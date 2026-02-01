import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Review from '@/models/Review';
import App from '@/models/App';

// GET - Fetch current user's reviews
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const reviews = await Review.find({ authorId: session.user.id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'appId',
        model: App,
        select: 'title icon category',
      })
      .lean();

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
