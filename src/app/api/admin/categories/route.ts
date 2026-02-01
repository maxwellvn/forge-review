import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Category from '@/models/Category';
import User from '@/models/User';

// GET /api/admin/categories - List all categories
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || '';

    const query: Record<string, unknown> = {};
    if (type) {
      query.type = type;
    }

    const categories = await Category.find(query)
      .sort({ type: 1, order: 1, name: 1 })
      .lean();

    const serializedCategories = categories.map((c) => ({
      ...c,
      _id: c._id.toString(),
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
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

// POST /api/admin/categories - Create category
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

    const body = await request.json();
    const { name, slug, type, description, color, icon } = body;

    if (!name || !slug || !type) {
      return NextResponse.json(
        { error: 'Name, slug, and type are required' },
        { status: 400 }
      );
    }

    const validTypes = ['discussion', 'app', 'review'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid category type' },
        { status: 400 }
      );
    }

    // Check for duplicate slug within type
    const existing = await Category.findOne({ slug, type });
    if (existing) {
      return NextResponse.json(
        { error: 'A category with this slug already exists for this type' },
        { status: 400 }
      );
    }

    // Get highest order for this type
    const lastCategory = await Category.findOne({ type })
      .sort({ order: -1 })
      .select('order');
    const order = lastCategory ? lastCategory.order + 1 : 0;

    const category = await Category.create({
      name,
      slug: slug.toLowerCase().replace(/\s+/g, '_'),
      type,
      description,
      color: color || 'gray',
      icon,
      order,
    });

    return NextResponse.json({
      category: {
        ...category.toObject(),
        _id: category._id.toString(),
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
