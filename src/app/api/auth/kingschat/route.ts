import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { encode } from 'next-auth/jwt';
import { cookies } from 'next/headers';
import connectDB from '@/lib/db';
import User from '@/models/User';

const KINGSCHAT_API_URL = 'https://connect.kingsch.at/api/profile';

const kingschatAuthSchema = z.object({
  accessToken: z.string().min(1, 'Access token is required'),
  refreshToken: z.string().optional(),
});

interface KingsChatUserInfo {
  id: string;
  username: string;
  email?: string;
  displayName?: string;
  avatar?: string;
}

async function getKingsChatUserInfo(accessToken: string): Promise<KingsChatUserInfo | null> {
  try {
    const response = await fetch(KINGSCHAT_API_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error('KingsChat API error:', response.status, await response.text());
      return null;
    }

    const data = await response.json();

    const profileData = data.profile || data;
    const user = profileData.user || profileData;
    const emailData = profileData.email || {};

    const id = user.user_id || user.id || user.userId;
    const username = user.username || user.user_name || `user_${id}`;
    const displayName = user.name || user.display_name || user.displayName || user.full_name || username;
    const email = typeof emailData === 'object' ? emailData.address : emailData;
    const avatar = user.avatar_url || user.avatar || user.profile_picture || user.profilePicture || user.image;

    return {
      id,
      username,
      email,
      displayName,
      avatar,
    };
  } catch (error) {
    console.error('Failed to get KingsChat user info:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = kingschatAuthSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return NextResponse.json(
        { success: false, error: firstError?.message || 'Validation error' },
        { status: 400 }
      );
    }

    const { accessToken } = validation.data;

    const kingschatUser = await getKingsChatUserInfo(accessToken);
    if (!kingschatUser) {
      return NextResponse.json(
        { success: false, error: 'Failed to authenticate with KingsChat. Please try again.' },
        { status: 401 }
      );
    }

    await connectDB();

    // Check if user already exists with this KingsChat ID
    let user = await User.findOne({ kingschatId: kingschatUser.id });

    if (!user) {
      // Check if user exists with same email
      const emailToUse = kingschatUser.email || `${kingschatUser.id}@kingschat.local`;
      user = await User.findOne({ email: emailToUse.toLowerCase() });

      if (user) {
        // Link KingsChat to existing account
        user.kingschatId = kingschatUser.id;
        if (kingschatUser.avatar && !user.image) {
          user.image = kingschatUser.avatar;
        }
        await user.save();
      } else {
        // Create new user
        user = await User.create({
          email: emailToUse.toLowerCase(),
          name: kingschatUser.displayName || kingschatUser.username,
          image: kingschatUser.avatar,
          role: 'user',
          kingschatId: kingschatUser.id,
        });
      }
    }

    // Create JWT token for NextAuth session
    const token = await encode({
      token: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        picture: user.image,
        role: user.role,
        isVerified: user.isVerified,
        sub: user._id.toString(),
      },
      secret: process.env.NEXTAUTH_SECRET!,
    });

    // Set the session cookie
    const cookieStore = await cookies();
    const isProduction = process.env.NODE_ENV === 'production';

    cookieStore.set('next-auth.session-token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    // Also set the secure cookie name for production
    if (isProduction) {
      cookieStore.set('__Secure-next-auth.session-token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        },
      },
      message: 'Login successful',
    });
  } catch (error) {
    console.error('KingsChat auth error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred during authentication' },
      { status: 500 }
    );
  }
}
