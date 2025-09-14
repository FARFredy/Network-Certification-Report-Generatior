import express from 'express';
import { verifyToken } from '../middleware/authMiddleware';
import { checkAdmin } from '../middleware/roleMiddleware';
import User from '../models/User';
import Conversation from '../models/Conversation';
import Message from '../models/Message';
import PredefinedResponse from '../models/PredefinedResponse';

const router = express.Router();

router.use(verifyToken);
router.use(checkAdmin);

router.get('/metrics', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    // Avg response time: simplificado, calcular diferencia entre mensajes consecutivos
    const messages = await Message.find().sort({ timestamp: 1 });
    let totalTime = 0;
    let count = 0;
    for (let i = 1; i < messages.length; i++) {
      if (messages[i].sender === 'bot' && messages[i-1].sender === 'user') {
        totalTime += messages[i].timestamp.getTime() - messages[i-1].timestamp.getTime();
        count++;
      }
    }
    const avgResponseTime = count > 0 ? totalTime / count : 0;
    const interactionsByIntent = await Message.aggregate([
      { $match: { intent: { $ne: null } } },
      { $group: { _id: '$intent', count: { $sum: 1 } } }
    ]);
    res.json({ userCount, avgResponseTime, interactionsByIntent });
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo métricas' });
  }
});

router.get('/conversations', async (req, res) => {
  try {
    const conversations = await Conversation.find().populate('messages');
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo conversaciones' });
  }
});

router.put('/predefined/:id', async (req, res) => {
  const { response } = req.body;
  try {
    const updated = await PredefinedResponse.findByIdAndUpdate(req.params.id, { response, updatedAt: new Date() }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Respuesta no encontrada' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando respuesta' });
  }
});

export default router;