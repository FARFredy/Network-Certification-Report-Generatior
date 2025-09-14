import { Server, Socket } from 'socket.io';
import { processMessage } from '../services/intentService';
import Conversation from '../models/Conversation';

export function socketHandler(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('Usuario conectado:', socket.id);

    socket.on('join', (userId: string) => {
      socket.join(userId);
      console.log(`Usuario ${userId} se unió a la room`);
    });

    socket.on('message', async (data: { userId: string; content: string }) => {
      try {
        // Buscar conversación activa
        let conversation = await Conversation.findOne({ userId: data.userId, status: 'active' });
        if (!conversation) {
          conversation = new Conversation({ userId: data.userId });
          await conversation.save();
        }

        // Procesar mensaje con IA
        const { userMessage, botMessage } = await processMessage(data.userId, conversation._id.toString(), data.content);

        // Emitir respuesta del bot
        io.to(data.userId).emit('botResponse', {
          content: botMessage.content,
          conversationId: conversation._id.toString()
        });
      } catch (error) {
        console.error('Error procesando mensaje:', error);
        io.to(data.userId).emit('error', { message: 'Error procesando mensaje' });
      }
    });

    socket.on('disconnect', () => {
      console.log('Usuario desconectado:', socket.id);
    });
  });
}