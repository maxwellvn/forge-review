import mongoose, { Schema, Document } from 'mongoose';

export interface IVote {
  userId: mongoose.Types.ObjectId;
  type: 'helpful' | 'unhelpful';
}

export interface IReview extends Document {
  appId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  content: string;
  rating: number;
  isSuperReview: boolean;
  likes: number;
  likedBy: mongoose.Types.ObjectId[];
  isVerifiedPurchase: boolean;
  helpful: number;
  unhelpful: number;
  votes: IVote[];
  isHidden: boolean;
  isFlagged: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema({
  appId: {
    type: Schema.Types.ObjectId,
    ref: 'App',
    required: true,
    index: true,
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
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  isSuperReview: {
    type: Boolean,
    default: false,
  },
  likes: {
    type: Number,
    default: 0,
  },
  likedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  isVerifiedPurchase: {
    type: Boolean,
    default: false,
  },
  helpful: {
    type: Number,
    default: 0,
  },
  unhelpful: {
    type: Number,
    default: 0,
  },
  votes: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['helpful', 'unhelpful'],
      required: true,
    },
  }],
  isHidden: {
    type: Boolean,
    default: false,
  },
  isFlagged: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

ReviewSchema.index({ appId: 1, createdAt: -1 });
ReviewSchema.index({ authorId: 1 });

export default mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);