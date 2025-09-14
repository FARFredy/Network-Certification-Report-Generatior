import React from 'react';

const HistoryPanel: React.FC = () => {
  const conversations = ['Conversación 1', 'Conversación 2', 'Conversación 3']; // Placeholder

  return (
    <div className="p-4 bg-white shadow-md rounded">
      <h3 className="text-lg font-semibold mb-4">Historial de Conversaciones</h3>
      <ul className="space-y-2">
        {conversations.map((conv, index) => (
          <li key={index} className="p-2 bg-gray-100 rounded cursor-pointer hover:bg-gray-200">
            {conv}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HistoryPanel;