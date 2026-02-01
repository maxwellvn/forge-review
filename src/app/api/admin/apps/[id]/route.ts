import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import App from '@/models/App';
import { requireAdminOrModerator } from '@/lib/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminOrModerator();
  if (error) return error;

  try {
    await connectDB();
    const { id } = await params;

    const app = await App.findById(id)
      .populate('uploader', 'name email image role')
      .select('-__v');

    if (!app) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 });
    }

    return NextResponse.json({ app });
  } catch (error) {
    console.error('Admin get app error:', error);
    return NextResponse.json({ error: 'Failed to fetch app' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminOrModerator();
  if (error) return error;

  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const app = await App.findById(id);

    if (!app) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 });
    }

    // Update allowed fields
    const allowedFields = ['status', 'isVerified', 'isFeatured', 'title', 'description', 'shortDescription', 'category', 'tags'];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        app[field] = body[field];
      }
    }

    await app.save();

    return NextResponse.json({ app, message: 'App updated successfully' });
  } catch (error) {
    console.error('Admin update app error:', error);
    return NextResponse.json({ error: 'Failed to update app' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminOrModerator();
  if (error) return error;

  try {
    await connectDB();
    const { id } = await params;

    const app = await App.findById(id);

    if (!app) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 });
    }

    await App.findByIdAndDelete(id);

    return NextResponse.json({ message: 'App deleted successfully' });
  } catch (error) {
    console.error('Admin delete app error:', error);
    return NextResponse.json({ error: 'Failed to delete app' }, { status: 500 });
  }
}
