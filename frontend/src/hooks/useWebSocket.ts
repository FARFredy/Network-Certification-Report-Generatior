import { useEffect, useRef } from 'react';

import io from 'socket.io-client';

export const useWebSocket = () => {
  const socketRef = useRef<any>(null);

  const connect = () => {
    socketRef.current = io('http://localhost:3001');
  };

  const emitMessage = (message: string) => {
    socketRef.current?.emit('message', message);
  };

  const onBotResponse = (callback: (response: string) => void) => {
    socketRef.current?.on('botResponse', callback);
  };

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return { connect, emitMessage, onBotResponse };
};