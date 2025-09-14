import express from 'express';
import { verifyToken } from '../middleware/authMiddleware';
import Conversation from '../models/Conversation';
import Message from '../models/Message';

const router = express.Router();

router.use(verifyToken);

router.get('/history', async (req, res) => {
  const userId = (req as any).user.id;
  try {
    const conversations = await Conversation.find({ userId }).populate('messages');
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo historial' });
  }
});

router.post('/messages', async (req, res) => {
  const { content, conversationId } = req.body;
  const userId = (req as any).user.id;
  try {
    let convId = conversationId;
    if (!convId) {
      const newConv = new Conversation({ userId });
      await newConv.save();
      convId = newConv._id;
    }
    const message = new Message({ conversationId: convId, userId, content, sender: 'user' });
    await message.save();
    // Actualizar conversación con mensaje
    await Conversation.findByIdAndUpdate(convId, { $push: { messages: message._id } });
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error guardando mensaje' });
  }
});

export default router;