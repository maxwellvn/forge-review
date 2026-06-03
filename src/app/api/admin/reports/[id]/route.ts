import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Report from '@/models/Report';
import { requireAdminOrModerator } from '@/lib/admin';

const ALLOWED_STATUSES = ['pending', 'reviewing', 'resolved', 'dismissed'];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireAdminOrModerator();
  if (error) return error;

  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const report = await Report.findById(id);
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    if (body.status !== undefined) {
      if (!ALLOWED_STATUSES.includes(body.status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      report.status = body.status;
      // Record who closed it out
      if (body.status === 'resolved' || body.status === 'dismissed') {
        report.resolvedBy = session.user.id;
      } else {
        report.resolvedBy = undefined;
      }
    }

    if (body.adminNotes !== undefined) {
      report.adminNotes = String(body.adminNotes).slice(0, 1000);
    }

    await report.save();
    await report.populate('reporterId', 'name email image');
    await report.populate('appId', 'title iconUrl');
    await report.populate('resolvedBy', 'name');

    return NextResponse.json({ report, message: 'Report updated successfully' });
  } catch (error) {
    console.error('Admin update report error:', error);
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
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

    const report = await Report.findByIdAndDelete(id);
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Admin delete report error:', error);
    return NextResponse.json({ error: 'Failed to delete report' }, { status: 500 });
  }
}
