import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { requireAdmin } from '@/lib/admin';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    await connectDB();
    const { id } = await params;

    const user = await User.findById(id).select('-__v');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Admin get user error:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent self-demotion from admin
    if (user._id.toString() === session?.user.id && body.role && body.role !== 'admin') {
      return NextResponse.json({ error: 'Cannot demote yourself from admin' }, { status: 400 });
    }

    // Prevent banning self
    if (user._id.toString() === session?.user.id && body.isBanned) {
      return NextResponse.json({ error: 'Cannot ban yourself' }, { status: 400 });
    }

    // Update allowed fields
    const allowedFields = ['role', 'isVerified', 'isBanned', 'bannedReason', 'badges'];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'isBanned') {
          user.isBanned = body.isBanned;
          if (body.isBanned) {
            user.bannedAt = new Date();
            user.bannedReason = body.bannedReason || 'No reason provided';
          } else {
            user.bannedAt = undefined;
            user.bannedReason = undefined;
          }
        } else {
          user[field] = body[field];
        }
      }
    }

    await user.save();

    return NextResponse.json({ user, message: 'User updated successfully' });
  } catch (error) {
    console.error('Admin update user error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  try {
    await connectDB();
    const { id } = await params;

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent self-deletion
    if (user._id.toString() === session?.user.id) {
      return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
    }

    // Prevent deleting other admins
    if (user.role === 'admin') {
      return NextResponse.json({ error: 'Cannot delete admin users' }, { status: 400 });
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
