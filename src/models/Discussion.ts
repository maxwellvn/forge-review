import mongoose, { Schema, Document } from 'mongoose';

export type DiscussionCategory =
  | 'general'
  | 'feedback'
  | 'bug_report'
  | 'feature_request'
  | 'showcase'
  | 'question';

export interface IMention {
  type: 'user' | 'app';
  refId: mongoose.Types.ObjectId;
  displayName: string;
  startIndex: number;
  endIndex: number;
}

export interface IDiscussion extends Document {
  title: string;
  content: string;
  contentHtml: string;
  authorId: mongoose.Types.ObjectId;
  category: DiscussionCategory;
  mentions: IMention[];

  // Voting
  upvotes: number;
  downvotes: number;
  score: number;
  hotScore: number;

  // Engagement
  commentCount: number;
  viewCount: number;
  lastActivityAt: Date;

  // Moderation
  isPinned: boolean;
  isLocked: boolean;
  isHidden: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const MentionSchema = new Schema({
  type: {
    type: String,
    enum: ['user', 'app'],
    required: true,
  },
  refId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'mentions.type',
  },
  displayName: {
    type: String,
    required: true,
  },
  startIndex: {
    type: Number,
    required: true,
  },
  endIndex: {
    type: Number,
    required: true,
  },
}, { _id: false });

const DiscussionSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000,
  },
  contentHtml: {
    type: String,
    required: true,
  },
  authorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    enum: ['general', 'feedback', 'bug_report', 'feature_request', 'showcase', 'question'],
    default: 'general',
  },
  mentions: [MentionSchema],

  // Voting
  upvotes: {
    type: Number,
    default: 0,
  },
  downvotes: {
    type: Number,
    default: 0,
  },
  score: {
    type: Number,
    default: 0,
  },
  hotScore: {
    type: Number,
    default: 0,
  },

  // Engagement
  commentCount: {
    type: Number,
    default: 0,
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  lastActivityAt: {
    type: Date,
    default: Date.now,
  },

  // Moderation
  isPinned: {
    type: Boolean,
    default: false,
  },
  isLocked: {
    type: Boolean,
    default: false,
  },
  isHidden: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Indexes for efficient querying
DiscussionSchema.index({ category: 1, isHidden: 1 });
DiscussionSchema.index({ hotScore: -1 });
DiscussionSchema.index({ score: -1 });
DiscussionSchema.index({ createdAt: -1 });
DiscussionSchema.index({ lastActivityAt: -1 });
DiscussionSchema.index({ authorId: 1 });
DiscussionSchema.index({ isPinned: -1, hotScore: -1 });

export default mongoose.models.Discussion || mongoose.model<IDiscussion>('Discussion', DiscussionSchema);
