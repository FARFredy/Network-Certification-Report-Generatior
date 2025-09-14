import mongoose, { Schema } from 'mongoose';
import { Conversation } from '../../../shared/types';

const conversationSchema = new Schema<Conversation>({
  userId: { type: String, ref: 'User', required: true },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  status: { type: String, enum: ['active', 'closed'], default: 'active' },
  messages: [{ type: String, ref: 'Message' }]
});

export default mongoose.model<Conversation>('Conversation', conversationSchema);