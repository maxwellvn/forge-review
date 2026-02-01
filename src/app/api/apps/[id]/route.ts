import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import App from '@/models/App';
import { incrementAppViews, getCachedAppMetadata, cacheAppMetadata, redis, getAppViews } from '@/lib/redis';
import { updateAppPulseScore } from '@/lib/pulseScore';
import { z } from 'zod';

const updateAppSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().min(10).max(5000).optional(),
  shortDescription: z.string().min(10).max(200).optional(),
  category: z.string().min(1).optional(), // Dynamic - validated against DB categories
  downloadUrl: z.string().url().optional(),
  iconUrl: z.string().url().optional().or(z.literal('')),
  screenshots: z.array(z.string().url()).optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get IP address for unique view tracking
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor?.split(',')[0]?.trim() ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // Track the view
    const { views, isNewView } = await incrementAppViews(id, ip);

    await connectDB();

    // If new unique view, update DB and pulse score
    if (isNewView) {
      await App.findByIdAndUpdate(id, { views });
      // Update pulse score async to not block response
      updateAppPulseScore(id).catch(console.error);
      // Clear cache so fresh data is fetched
      await redis.del(`app:metadata:${id}`);
    }

    const cached = await getCachedAppMetadata<any>(id);
    if (cached) {
      // Return cached but with updated views
      return NextResponse.json({ app: { ...cached, views } });
    }

    const app = await App.findById(id)
      .populate('uploader', 'name image role')
      .lean();

    if (!app) {
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404 }
      );
    }

    await cacheAppMetadata(id, app);

    return NextResponse.json({ app });
  } catch (error) {
    console.error('Error fetching app:', error);
    return NextResponse.json(
      { error: 'Failed to fetch app' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateAppSchema.parse(body);

    await connectDB();

    const app = await App.findById(id);

    if (!app) {
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404 }
      );
    }

    // Check if user is the owner or an admin/moderator
    const isOwner = app.uploader.toString() === session.user.id;
    const isAdminOrMod = session.user.role === 'admin' || session.user.role === 'moderator';

    if (!isOwner && !isAdminOrMod) {
      return NextResponse.json(
        { error: 'You can only edit your own apps' },
        { status: 403 }
      );
    }

    // Update allowed fields
    const allowedFields = ['title', 'description', 'shortDescription', 'category', 'downloadUrl', 'iconUrl', 'screenshots', 'tags'];

    for (const field of allowedFields) {
      if (validatedData[field as keyof typeof validatedData] !== undefined) {
        (app as any)[field] = validatedData[field as keyof typeof validatedData];
      }
    }

    // If owner edits, set status back to pending for re-review (unless admin/mod)
    if (isOwner && !isAdminOrMod) {
      app.status = 'pending';
    }

    await app.save();

    // Clear cache
    await redis.del(`app:metadata:${id}`);

    await app.populate('uploader', 'name image role');

    return NextResponse.json({
      app,
      message: isOwner && !isAdminOrMod
        ? 'App updated successfully. It will be reviewed again before going live.'
        : 'App updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error updating app:', error);
    return NextResponse.json(
      { error: 'Failed to update app' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    await connectDB();

    const app = await App.findById(id);

    if (!app) {
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404 }
      );
    }

    // Check if user is the owner or an admin
    const isOwner = app.uploader.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'You can only delete your own apps' },
        { status: 403 }
      );
    }

    await App.findByIdAndDelete(id);

    // Clear cache
    await redis.del(`app:metadata:${id}`);

    return NextResponse.json({ message: 'App deleted successfully' });
  } catch (error) {
    console.error('Error deleting app:', error);
    return NextResponse.json(
      { error: 'Failed to delete app' },
      { status: 500 }
    );
  }
}