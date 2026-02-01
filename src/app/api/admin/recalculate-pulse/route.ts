import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import connectDB from '@/lib/db';
import App from '@/models/App';
import { updateAppPulseScore } from '@/lib/pulseScore';

export async function POST() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    await connectDB();

    const apps = await App.find().select('_id').lean();

    let updated = 0;
    for (const app of apps) {
      try {
        await updateAppPulseScore(app._id.toString());
        updated++;
      } catch (e) {
        console.error(`Failed to update pulse score for app ${app._id}:`, e);
      }
    }

    return NextResponse.json({
      message: `Recalculated pulse scores for ${updated} apps`,
      total: apps.length,
      updated,
    });
  } catch (error) {
    console.error('Error recalculating pulse scores:', error);
    return NextResponse.json(
      { error: 'Failed to recalculate pulse scores' },
      { status: 500 }
    );
  }
}
