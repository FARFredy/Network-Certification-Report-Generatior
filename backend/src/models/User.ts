import mongoose, { Schema } from 'mongoose';
import { User } from '../../../shared/types';

const userSchema = new Schema<User>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'cliente'], default: 'cliente' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<User>('User', userSchema);