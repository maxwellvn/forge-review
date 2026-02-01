import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Review from '@/models/Review';
import { requireAdminOrModerator } from '@/lib/admin';

export async function GET(request: NextRequest) {
  const { error } = await requireAdminOrModerator();
  if (error) return error;

  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const appId = searchParams.get('appId') || '';
    const authorId = searchParams.get('authorId') || '';

    const query: Record<string, unknown> = {};

    if (search) {
      query.content = { $regex: search, $options: 'i' };
    }

    if (appId) {
      query.appId = appId;
    }

    if (authorId) {
      query.authorId = authorId;
    }

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('authorId', 'name email image')
        .populate('appId', 'title iconUrl')
        .select('-__v'),
      Review.countDocuments(query),
    ]);

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin reviews error:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}
