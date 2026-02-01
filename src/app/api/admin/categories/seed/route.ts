import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Category from '@/models/Category';
import User from '@/models/User';

const defaultCategories = [
  // Discussion categories
  { name: 'General', slug: 'general', type: 'discussion', color: 'gray', order: 0 },
  { name: 'Feedback', slug: 'feedback', type: 'discussion', color: 'blue', order: 1 },
  { name: 'Bug Report', slug: 'bug_report', type: 'discussion', color: 'red', order: 2 },
  { name: 'Feature Request', slug: 'feature_request', type: 'discussion', color: 'purple', order: 3 },
  { name: 'Showcase', slug: 'showcase', type: 'discussion', color: 'green', order: 4 },
  { name: 'Question', slug: 'question', type: 'discussion', color: 'yellow', order: 5 },

  // App platform categories (existing hardcoded ones)
  { name: 'Web', slug: 'web', type: 'app', color: 'blue', order: 0 },
  { name: 'Mobile', slug: 'mobile', type: 'app', color: 'green', order: 1 },
  { name: 'Desktop', slug: 'desktop', type: 'app', color: 'purple', order: 2 },

  // Review categories
  { name: 'Positive', slug: 'positive', type: 'review', color: 'green', order: 0 },
  { name: 'Critical', slug: 'critical', type: 'review', color: 'red', order: 1 },
  { name: 'Feature Review', slug: 'feature_review', type: 'review', color: 'blue', order: 2 },
  { name: 'Comparison', slug: 'comparison', type: 'review', color: 'purple', order: 3 },
];

// POST /api/admin/categories/seed - Seed default categories
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let created = 0;
    let skipped = 0;

    for (const cat of defaultCategories) {
      const existing = await Category.findOne({ slug: cat.slug, type: cat.type });
      if (!existing) {
        await Category.create(cat);
        created++;
      } else {
        skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Created ${created} categories, skipped ${skipped} existing`,
      created,
      skipped,
    });
  } catch (error) {
    console.error('Error seeding categories:', error);
    return NextResponse.json(
      { error: 'Failed to seed categories' },
      { status: 500 }
    );
  }
}
