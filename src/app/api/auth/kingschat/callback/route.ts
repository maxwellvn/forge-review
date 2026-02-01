import { NextRequest, NextResponse } from 'next/server';

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || '';

async function parseBody(request: NextRequest): Promise<Record<string, string>> {
  const contentType = request.headers.get('content-type') || '';

  try {
    if (contentType.includes('application/json')) {
      return await request.json();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await request.text();
      const params = new URLSearchParams(text);
      const result: Record<string, string> = {};
      params.forEach((value, key) => {
        result[key] = value;
      });
      return result;
    } else {
      const text = await request.text();
      try {
        return JSON.parse(text);
      } catch {
        const params = new URLSearchParams(text);
        const result: Record<string, string> = {};
        params.forEach((value, key) => {
          result[key] = value;
        });
        return result;
      }
    }
  } catch (error) {
    console.error('Failed to parse body:', error);
    return {};
  }
}

function buildRedirectUrl(path: string, params: Record<string, string> = {}): string {
  const baseUrl = APP_BASE_URL || 'http://localhost:3000';
  const url = new URL(path, baseUrl);

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await parseBody(request);
    const { searchParams } = new URL(request.url);

    const redirectPath = searchParams.get('redirect') || '/auth/kingschat-callback';

    const accessToken = body?.accessToken || body?.access_token;
    const refreshToken = body?.refreshToken || body?.refresh_token;
    const expiresIn = body?.expiresInMillis || body?.expires_in_millis || body?.expires_in;

    if (!accessToken) {
      const errorUrl = buildRedirectUrl(redirectPath, { error: 'no_token' });
      return NextResponse.redirect(errorUrl);
    }

    const params: Record<string, string> = {
      access_token: accessToken,
    };

    if (refreshToken) params.refresh_token = refreshToken;
    if (expiresIn) params.expires_in_millis = String(expiresIn);

    const callbackUrl = buildRedirectUrl(redirectPath, params);
    return NextResponse.redirect(callbackUrl);
  } catch (error) {
    console.error('KingsChat callback error:', error);
    const errorUrl = buildRedirectUrl('/auth/kingschat-callback', { error: 'callback_failed' });
    return NextResponse.redirect(errorUrl);
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);

    const redirectPath = searchParams.get('redirect') || '/auth/kingschat-callback';

    const accessToken = searchParams.get('accessToken') || searchParams.get('access_token');
    const refreshToken = searchParams.get('refreshToken') || searchParams.get('refresh_token');
    const expiresIn = searchParams.get('expiresInMillis') || searchParams.get('expires_in_millis') || searchParams.get('expires_in');

    if (!accessToken) {
      const errorUrl = buildRedirectUrl(redirectPath, { error: 'no_token' });
      return NextResponse.redirect(errorUrl);
    }

    const params: Record<string, string> = {
      access_token: accessToken,
    };

    if (refreshToken) params.refresh_token = refreshToken;
    if (expiresIn) params.expires_in_millis = String(expiresIn);

    const callbackUrl = buildRedirectUrl(redirectPath, params);
    return NextResponse.redirect(callbackUrl);
  } catch (error) {
    console.error('KingsChat callback GET error:', error);
    const errorUrl = buildRedirectUrl('/auth/kingschat-callback', { error: 'callback_failed' });
    return NextResponse.redirect(errorUrl);
  }
}
