import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { NextResponse } from 'next/server';

export type AdminRole = 'admin' | 'moderator';

export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), session: null };
  }

  if (session.user.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 }), session: null };
  }

  return { error: null, session };
}

export async function requireAdminOrModerator() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), session: null };
  }

  const allowedRoles: AdminRole[] = ['admin', 'moderator'];
  if (!allowedRoles.includes(session.user.role as AdminRole)) {
    return { error: NextResponse.json({ error: 'Forbidden: Admin or Moderator access required' }, { status: 403 }), session: null };
  }

  return { error: null, session };
}

export function isAdmin(role: string | undefined): boolean {
  return role === 'admin';
}

export function isAdminOrModerator(role: string | undefined): boolean {
  return role === 'admin' || role === 'moderator';
}
