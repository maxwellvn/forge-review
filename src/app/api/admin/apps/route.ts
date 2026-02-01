import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import App from '@/models/App';
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
    const status = searchParams.get('status') || '';
    const category = searchParams.get('category') || '';

    const query: Record<string, unknown> = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    const skip = (page - 1) * limit;

    const [apps, total] = await Promise.all([
      App.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('uploader', 'name email image')
        .select('-__v'),
      App.countDocuments(query),
    ]);

    return NextResponse.json({
      apps,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin apps error:', error);
    return NextResponse.json({ error: 'Failed to fetch apps' }, { status: 500 });
  }
}
