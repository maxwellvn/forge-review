import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Category from '@/models/Category';

// GET /api/categories - List active categories (public)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || '';

    const query: Record<string, unknown> = { isActive: true };
    if (type) {
      query.type = type;
    }

    const categories = await Category.find(query)
      .sort({ order: 1, name: 1 })
      .select('name slug type color icon description')
      .lean();

    const serializedCategories = categories.map((c) => ({
      ...c,
      _id: c._id.toString(),
    }));

    return NextResponse.json({ categories: serializedCategories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
