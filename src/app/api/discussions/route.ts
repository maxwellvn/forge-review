import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Discussion from '@/models/Discussion';
import User from '@/models/User';
import App from '@/models/App';
import { canCreateDiscussion } from '@/lib/permissions';
import { parseMentions, formatContent } from '@/lib/mentions';
import { calculateHotScore } from '@/lib/scoring';
import { getSortConfig } from '@/lib/scoring';
import mongoose from 'mongoose';

// GET /api/discussions - List discussions
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sort') || 'hot';
    const category = searchParams.get('category');

    const skip = (page - 1) * limit;

    // Build query
    const query: Record<string, unknown> = { isHidden: false };
    if (category) {
      query.category = category;
    }

    // Get sort config
    const { field, order } = getSortConfig(sortBy);

    // Fetch discussions with author populated
    const [discussions, total] = await Promise.all([
      Discussion.find(query)
        .populate('authorId', 'name image username')
        .sort({ isPinned: -1, [field]: order })
        .skip(skip)
        .limit(limit)
        .lean(),
      Discussion.countDocuments(query),
    ]);

    return NextResponse.json({
      discussions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching discussions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discussions' },
      { status: 500 }
    );
  }
}

// POST /api/discussions - Create discussion
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get user and check permissions
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!canCreateDiscussion(user.role)) {
      return NextResponse.json(
        { error: 'You do not have permission to create discussions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, content, category } = body;

    // Validate input
    if (!title || title.length > 200) {
      return NextResponse.json(
        { error: 'Title is required and must be 200 characters or less' },
        { status: 400 }
      );
    }

    if (!content || content.length > 10000) {
      return NextResponse.json(
        { error: 'Content is required and must be 10000 characters or less' },
        { status: 400 }
      );
    }

    const validCategories = [
      'general',
      'feedback',
      'bug_report',
      'feature_request',
      'showcase',
      'question',
    ];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    // Parse mentions
    const parsedMentions = parseMentions(content);

    // Resolve mention refIds
    const mentions = await Promise.all(
      parsedMentions.map(async (mention) => {
        let refId: mongoose.Types.ObjectId | null = null;

        if (mention.type === 'user') {
          const mentionedUser = await User.findOne({
            $or: [
              { username: mention.displayName },
              { name: mention.displayName },
            ],
          });
          refId = mentionedUser?._id || null;
        } else {
          const mentionedApp = await App.findOne({ name: mention.displayName });
          refId = mentionedApp?._id || null;
        }

        return {
          ...mention,
          refId: refId || new mongoose.Types.ObjectId(), // Fallback to dummy ID if not found
        };
      })
    );

    // Filter out unresolved mentions
    const resolvedMentions = mentions.filter(
      (m) => m.refId && !m.refId.equals(new mongoose.Types.ObjectId())
    );

    // Generate HTML content with mentions
    const contentHtml = formatContent(content, resolvedMentions);

    // Calculate initial hot score
    const now = new Date();
    const hotScore = calculateHotScore(0, 0, now, 0);

    // Create discussion
    const discussion = await Discussion.create({
      title,
      content,
      contentHtml,
      authorId: user._id,
      category,
      mentions: resolvedMentions,
      upvotes: 0,
      downvotes: 0,
      score: 0,
      hotScore,
      controversialScore: 0,
      commentCount: 0,
      viewCount: 0,
      lastActivityAt: now,
      isPinned: false,
      isLocked: false,
      isHidden: false,
    });

    // Populate author before returning
    await discussion.populate('authorId', 'name image username');

    return NextResponse.json({ discussion }, { status: 201 });
  } catch (error) {
    console.error('Error creating discussion:', error);
    return NextResponse.json(
      { error: 'Failed to create discussion' },
      { status: 500 }
    );
  }
}
