import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import App from '@/models/App';

// GET /api/mentions/search - Search for users and apps for autocomplete
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all';
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 20);

    if (query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const results: Array<{
      type: 'user' | 'app';
      id: string;
      name: string;
      image?: string;
    }> = [];

    // Always search both users and apps regardless of trigger type
    // Search users
    const users = await User.find({
      name: { $regex: query, $options: 'i' },
      isBanned: { $ne: true },
    })
      .select('name image')
      .limit(limit)
      .lean();

    results.push(
      ...users.map((user) => ({
        type: 'user' as const,
        id: user._id.toString(),
        name: user.name,
        image: user.image,
      }))
    );

    // Search apps
    const apps = await App.find({
      title: { $regex: query, $options: 'i' },
      status: 'approved',
    })
      .select('title iconUrl')
      .limit(limit)
      .lean();

    results.push(
      ...apps.map((app) => ({
        type: 'app' as const,
        id: app._id.toString(),
        name: app.title,
        image: app.iconUrl,
      }))
    );

    // Sort by relevance (exact match first, then prefix match, then contains)
    results.sort((a, b) => {
      const aLower = a.name.toLowerCase();
      const bLower = b.name.toLowerCase();
      const qLower = query.toLowerCase();

      const aExact = aLower === qLower;
      const bExact = bLower === qLower;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      const aPrefix = aLower.startsWith(qLower);
      const bPrefix = bLower.startsWith(qLower);
      if (aPrefix && !bPrefix) return -1;
      if (!aPrefix && bPrefix) return 1;

      return aLower.localeCompare(bLower);
    });

    return NextResponse.json({ results: results.slice(0, limit) });
  } catch (error) {
    console.error('Error searching mentions:', error);
    return NextResponse.json(
      { error: 'Failed to search mentions' },
      { status: 500 }
    );
  }
}
