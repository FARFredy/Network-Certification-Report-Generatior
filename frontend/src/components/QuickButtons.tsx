import React from 'react';

const QuickButtons: React.FC = () => {
  const handleButtonClick = (action: string) => {
    // TODO: Implementar acciones rápidas
    console.log(`Acción: ${action}`);
  };

  return (
    <div className="flex flex-wrap gap-2 p-4 bg-white shadow-md rounded">
      <button
        onClick={() => handleButtonClick('Cotizar')}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Cotizar
      </button>
      <button
        onClick={() => handleButtonClick('Ayuda')}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Ayuda
      </button>
      <button
        onClick={() => handleButtonClick('Contacto')}
        className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
      >
        Contacto
      </button>
      <button
        onClick={() => handleButtonClick('FAQ')}
        className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
      >
        FAQ
      </button>
    </div>
  );
};

export default QuickButtons;