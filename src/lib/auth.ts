import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import connectDB from './db';
import User from '@/models/User';

// Get admin emails from environment
const getAdminEmails = (): string[] => {
  const adminEmails = process.env.ADMIN_EMAILS || '';
  return adminEmails.split(',').map(email => email.trim().toLowerCase()).filter(Boolean);
};

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        await connectDB();

        const existingUser = await User.findOne({ email: user.email });

        // Check if user is banned
        if (existingUser?.isBanned) {
          return false;
        }

        if (!existingUser) {
          // Check if this email should be an admin
          const adminEmails = getAdminEmails();
          const isAdmin = adminEmails.includes(user.email?.toLowerCase() || '');

          await User.create({
            email: user.email,
            name: user.name,
            image: user.image,
            role: isAdmin ? 'admin' : 'user',
          });
        } else {
          // Check if existing user should be promoted to admin
          const adminEmails = getAdminEmails();
          const shouldBeAdmin = adminEmails.includes(user.email?.toLowerCase() || '');

          if (shouldBeAdmin && existingUser.role !== 'admin') {
            existingUser.role = 'admin';
            await existingUser.save();
          }
        }

        return true;
      }
      return false;
    },
    async jwt({ token, user, account, trigger }) {
      if (account && user) {
        await connectDB();
        const dbUser = await User.findOne({ email: user.email });

        if (dbUser) {
          token.id = dbUser._id.toString();
          token.role = dbUser.role;
          token.isVerified = dbUser.isVerified;
        }
      }

      // Refresh user data on session update (e.g. after editing the profile)
      if (trigger === 'update' && token.email) {
        await connectDB();
        const dbUser = await User.findOne({ email: token.email });
        if (dbUser) {
          token.role = dbUser.role;
          token.isVerified = dbUser.isVerified;
          // Keep name/avatar in sync so the navbar reflects profile edits
          token.name = dbUser.name;
          token.picture = dbUser.image;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.isVerified = token.isVerified as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
};