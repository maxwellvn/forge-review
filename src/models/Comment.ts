import mongoose, { Schema, Document } from 'mongoose';
import { IMention } from './Discussion';

export interface IComment extends Document {
  discussionId: mongoose.Types.ObjectId;
  parentId: mongoose.Types.ObjectId | null;
  authorId: mongoose.Types.ObjectId;
  content: string;
  contentHtml: string;
  mentions: IMention[];

  // Threading
  depth: number;
  path: string;

  // Voting
  upvotes: number;
  downvotes: number;
  score: number;

  // Status
  isHidden: boolean;
  isDeleted: boolean;
  isEdited: boolean;

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

const CommentSchema: Schema = new Schema({
  discussionId: {
    type: Schema.Types.ObjectId,
    ref: 'Discussion',
    required: true,
  },
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
  },
  authorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000,
  },
  contentHtml: {
    type: String,
    required: true,
  },
  mentions: [MentionSchema],

  // Threading - materialized path for efficient tree queries
  depth: {
    type: Number,
    default: 0,
    min: 0,
    max: 4,
  },
  path: {
    type: String,
    default: '',
  },

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

  // Status
  isHidden: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  isEdited: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Indexes for efficient querying
CommentSchema.index({ discussionId: 1, path: 1 });
CommentSchema.index({ discussionId: 1, createdAt: 1 });
CommentSchema.index({ parentId: 1 });
CommentSchema.index({ authorId: 1 });
CommentSchema.index({ score: -1 });

export default mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);
