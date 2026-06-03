import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Report from '@/models/Report';
import App from '@/models/App';
import { z } from 'zod';

const createReportSchema = z.object({
  appId: z.string(),
  reason: z.enum([
    'spam',
    'inappropriate',
    'broken',
    'misleading',
    'malware',
    'copyright',
    'other',
  ]),
  details: z.string().max(1000).optional().default(''),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Please sign in to report an app' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createReportSchema.parse(body);

    await connectDB();

    const app = await App.findById(validatedData.appId).select('_id');
    if (!app) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 });
    }

    // Prevent the same user from filing duplicate open reports for the same app
    const existing = await Report.findOne({
      appId: validatedData.appId,
      reporterId: session.user.id,
      status: { $in: ['pending', 'reviewing'] },
    }).select('_id');

    if (existing) {
      return NextResponse.json(
        { error: 'You already have a pending report for this app' },
        { status: 409 }
      );
    }

    await Report.create({
      appId: validatedData.appId,
      reporterId: session.user.id,
      reason: validatedData.reason,
      details: validatedData.details?.trim() || '',
    });

    return NextResponse.json(
      { message: 'Report submitted. Our team will review it.' },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: (error as z.ZodError).issues },
        { status: 400 }
      );
    }
    console.error('Error creating report:', error);
    return NextResponse.json(
      { error: 'Failed to submit report' },
      { status: 500 }
    );
  }
}
