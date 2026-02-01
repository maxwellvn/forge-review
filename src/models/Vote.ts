import mongoose, { Schema, Document } from 'mongoose';

export type VoteTargetType = 'discussion' | 'comment';
export type VoteValue = 1 | -1;

export interface IVote extends Document {
  userId: mongoose.Types.ObjectId;
  targetType: VoteTargetType;
  targetId: mongoose.Types.ObjectId;
  value: VoteValue;
  createdAt: Date;
  updatedAt: Date;
}

const VoteSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  targetType: {
    type: String,
    enum: ['discussion', 'comment'],
    required: true,
  },
  targetId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'targetType',
  },
  value: {
    type: Number,
    enum: [1, -1],
    required: true,
  },
}, {
  timestamps: true,
});

// Compound unique index to ensure one vote per user per target
VoteSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });

// Index for finding all votes on a target
VoteSchema.index({ targetType: 1, targetId: 1 });

export default mongoose.models.Vote || mongoose.model<IVote>('Vote', VoteSchema);
