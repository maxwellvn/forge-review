import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Report from '@/models/Report';
import { requireAdminOrModerator } from '@/lib/admin';

export async function GET(request: NextRequest) {
  const { error } = await requireAdminOrModerator();
  if (error) return error;

  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || '';
    const appId = searchParams.get('appId') || '';

    const query: Record<string, unknown> = {};

    if (status) {
      query.status = status;
    }

    if (appId) {
      query.appId = appId;
    }

    const skip = (page - 1) * limit;

    const [reports, total, pendingCount] = await Promise.all([
      Report.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('reporterId', 'name email image')
        .populate('appId', 'title iconUrl')
        .populate('resolvedBy', 'name')
        .select('-__v'),
      Report.countDocuments(query),
      Report.countDocuments({ status: { $in: ['pending', 'reviewing'] } }),
    ]);

    return NextResponse.json({
      reports,
      pendingCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin reports error:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}
