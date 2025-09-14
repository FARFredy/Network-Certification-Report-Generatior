import { detectIntent, generateResponse } from './aiService';
import Message from '../models/Message';

export async function processMessage(userId: string, conversationId: string, content: string) {
  // Detectar intent
  const intent = await detectIntent(content);
  // Guardar mensaje user
  const userMessage = new Message({
    conversationId,
    userId,
    content,
    sender: 'user',
    intent
  });
  await userMessage.save();
  // Generar respuesta
  const response = await generateResponse(intent, content);
  // Guardar mensaje bot
  const botMessage = new Message({
    conversationId,
    userId,
    content: response,
    sender: 'bot',
    intent
  });
  await botMessage.save();
  return { userMessage, botMessage };
}