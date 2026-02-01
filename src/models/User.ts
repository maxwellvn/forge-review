import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'user' | 'verified_reviewer' | 'super_reviewer' | 'moderator' | 'admin';

export interface IUser extends Document {
  email: string;
  name: string;
  image?: string;
  role: UserRole;
  bio?: string;
  reviewsCount: number;
  helpfulVotes: number;
  joinedAt: Date;
  isVerified: boolean;
  badges: string[];
  kingschatId?: string;
  isBanned: boolean;
  bannedAt?: Date;
  bannedReason?: string;
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    enum: ['user', 'verified_reviewer', 'super_reviewer', 'moderator', 'admin'],
    default: 'user',
  },
  isBanned: {
    type: Boolean,
    default: false,
  },
  bannedAt: {
    type: Date,
    default: null,
  },
  bannedReason: {
    type: String,
    default: null,
  },
  bio: {
    type: String,
    default: '',
  },
  reviewsCount: {
    type: Number,
    default: 0,
  },
  helpfulVotes: {
    type: Number,
    default: 0,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  badges: [{
    type: String,
  }],
  kingschatId: {
    type: String,
    default: null,
    sparse: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);