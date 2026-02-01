import mongoose, { Schema, Document } from 'mongoose';

export type SubmissionType = 'package' | 'link' | 'store';
export type AppStatus = 'pending' | 'approved' | 'rejected';

export interface IApp extends Document {
  title: string;
  description: string;
  shortDescription: string;
  category: string; // Dynamic - fetched from Category collection
  submissionType: SubmissionType;
  downloadUrl: string;
  iconUrl: string;
  screenshots: string[];
  tags: string[];
  uploader: mongoose.Types.ObjectId;
  averageRating: number;
  totalReviews: number;
  isVerified: boolean;
  status: AppStatus;
  pulseScore: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const AppSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    required: true,
    maxlength: 5000,
  },
  shortDescription: {
    type: String,
    required: true,
    maxlength: 200,
  },
  category: {
    type: String,
    required: true,
  },
  submissionType: {
    type: String,
    enum: ['package', 'link', 'store'],
    required: true,
  },
  downloadUrl: {
    type: String,
    required: true,
  },
  iconUrl: {
    type: String,
    default: null,
  },
  screenshots: [{
    type: String,
  }],
  tags: [{
    type: String,
    trim: true,
  }],
  uploader: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  pulseScore: {
    type: Number,
    default: 0,
  },
  views: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

AppSchema.index({ category: 1, status: 1 });
AppSchema.index({ tags: 1 });
AppSchema.index({ pulseScore: -1 });

export default mongoose.models.App || mongoose.model<IApp>('App', AppSchema);