import mongoose, { Schema, Document } from 'mongoose';

export type ReportReason =
  | 'spam'
  | 'inappropriate'
  | 'broken'
  | 'misleading'
  | 'malware'
  | 'copyright'
  | 'other';

export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed';

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'spam', label: 'Spam or scam' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'broken', label: 'Broken or not working' },
  { value: 'misleading', label: 'Misleading information' },
  { value: 'malware', label: 'Malware or security risk' },
  { value: 'copyright', label: 'Copyright violation' },
  { value: 'other', label: 'Something else' },
];

export interface IReport extends Document {
  appId: mongoose.Types.ObjectId;
  reporterId: mongoose.Types.ObjectId;
  reason: ReportReason;
  details: string;
  status: ReportStatus;
  adminNotes: string;
  resolvedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema: Schema = new Schema(
  {
    appId: {
      type: Schema.Types.ObjectId,
      ref: 'App',
      required: true,
      index: true,
    },
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'broken', 'misleading', 'malware', 'copyright', 'other'],
      required: true,
    },
    details: {
      type: String,
      maxlength: 1000,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'resolved', 'dismissed'],
      default: 'pending',
      index: true,
    },
    adminNotes: {
      type: String,
      maxlength: 1000,
      default: '',
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

ReportSchema.index({ status: 1, createdAt: -1 });
ReportSchema.index({ appId: 1, createdAt: -1 });

export default mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);
