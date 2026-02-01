import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import App from '@/models/App';
import { z } from 'zod';
import { redis, getCachedAppMetadata, cacheAppMetadata, getTrendingApps } from '@/lib/redis';

const createAppSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(5000),
  shortDescription: z.string().min(10).max(200),
  category: z.string().min(1), // Dynamic - validated against DB categories
  submissionType: z.enum(['package', 'link', 'store']),
  downloadUrl: z.string().url(),
  iconUrl: z.string().url().optional(),
  screenshots: z.array(z.string().url()).optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const trending = searchParams.get('trending');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');

    await connectDB();

    if (trending === 'true') {
      const trendingAppIds = await getTrendingApps(limit);
      if (trendingAppIds.length > 0) {
        const apps = await App.find({ _id: { $in: trendingAppIds }, status: 'approved' })
          .populate('uploader', 'name image')
          .lean();
        return NextResponse.json({ apps }, {
          headers: {
            'Cache-Control': 'no-store, max-age=0',
          },
        });
      }
    }

    const query: Record<string, unknown> = { status: 'approved' };
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const skip = (page - 1) * limit;

    const apps = await App.find(query)
      .populate('uploader', 'name image')
      .sort({ pulseScore: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await App.countDocuments(query);

    return NextResponse.json({
      apps,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error fetching apps:', error);
    return NextResponse.json(
      { error: 'Failed to fetch apps' },
      { status: 500 }
    );
  }
}

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
    const validatedData = createAppSchema.parse(body);

    await connectDB();

    const newApp = await App.create({
      ...validatedData,
      uploader: session.user.id,
      status: 'pending',
    });

    await newApp.populate('uploader', 'name image');

    return NextResponse.json(
      { app: newApp, message: 'App submitted successfully' },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: (error as z.ZodError).issues },
        { status: 400 }
      );
    }
    console.error('Error creating app:', error);
    return NextResponse.json(
      { error: 'Failed to create app' },
      { status: 500 }
    );
  }
}