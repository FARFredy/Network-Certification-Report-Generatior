import mongoose, { Schema } from 'mongoose';
import { Message } from '../../../shared/types';

const messageSchema = new Schema<Message>({
  conversationId: { type: String, ref: 'Conversation', required: true },
  userId: { type: String, ref: 'User', required: true },
  content: { type: String, required: true },
  sender: { type: String, enum: ['user', 'bot'], required: true },
  timestamp: { type: Date, default: Date.now },
  intent: { type: String, enum: ['comprar', 'precios', 'soporte'], default: null }
});

export default mongoose.model<Message>('Message', messageSchema);