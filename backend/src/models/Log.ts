import mongoose, { Schema } from 'mongoose';
import { Log } from '../../../shared/types';

const logSchema = new Schema<Log>({
  userId: { type: String, ref: 'User', required: true },
  action: { type: String, enum: ['login', 'message', 'error'], required: true },
  timestamp: { type: Date, default: Date.now },
  details: { type: Schema.Types.Mixed }
});

export default mongoose.model<Log>('Log', logSchema);