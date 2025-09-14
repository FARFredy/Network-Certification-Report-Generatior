import React, { useState } from 'react';

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (input.trim()) {
      setMessages([...messages, input]);
      setInput('');
      // TODO: Emitir mensaje via WebSocket
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <div key={index} className="mb-2 p-2 bg-white rounded shadow">
            {msg}
          </div>
        ))}
      </div>
      <div className="p-4 bg-white border-t">
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu mensaje..."
            className="flex-1 p-2 border border-gray-300 rounded-l"
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white p-2 rounded-r"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;