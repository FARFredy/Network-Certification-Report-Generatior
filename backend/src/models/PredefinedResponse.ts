import mongoose, { Schema } from 'mongoose';
import { PredefinedResponse } from '../../../shared/types';

const predefinedResponseSchema = new Schema<PredefinedResponse>({
  intent: { type: String, enum: ['comprar', 'precios', 'soporte'], required: true },
  response: { type: String, required: true },
  editable: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<PredefinedResponse>('PredefinedResponse', predefinedResponseSchema);