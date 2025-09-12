import React, { useState, useRef } from 'react';
import { Plus, Download, Upload, Trash2, Check, X, FileText, BarChart3, AlertCircle } from 'lucide-react';

const DemoApp = () => {
  const [project, setProject] = useState({
    name: 'Proyecto Demo - Torres Corporativas',
    engineer: 'Ing. Fernando Forero',
    date: new Date().toLocaleDateString('es-ES'),
    time: new Date().toLocaleTimeString('es-ES'),
    equipment: 'www.wirescope.com'
  });

  const [cables, setCables] = useState([
    {
      id: 1,
      label: 'P11 PPA D4',
      result: true,
      destination: 'D4',
      networkType: 'Cat. 6A',
      length: '42.0'
    },
    {
      id: 2,
      label: 'P11 PPA D6',
      result: false,
      destination: 'D6',
      networkType: 'Cat. 6A',
      length: '64.0'
    },
    {
      id: 3,
      label: 'P11 PPA D7',
      result: true,
      destination: 'D7',
      networkType: 'Cat. 6A',
      length: '38.5'
    }
  ]);

  const [newCable, setNewCable] = useState({
    label: '',
    result: true,
    destination: '',
    networkType: 'Cat. 6A',
    length: ''
  });

  const fileInputRef = useRef(null);

  // Agregar cable individual
  const addCable = () => {
    if (newCable.label && newCable.destination && newCable.length) {
      setCables([...cables, { ...newCable, id: Date.now() }]);
      setNewCable({
        label: '',
        result: true,
        destination: '',
        networkType: 'Cat. 6A',
        length: ''
      });
    }
  };

  // Eliminar cable
  const removeCable = (id) => {
    setCables(cables.filter(cable => cable.id !== id));
  };

  // Calcular estadísticas
  const stats = {
    total: cables.length,
    passed: cables.filter(c => c.result).length,
    failed: cables.filter(c => !c.result).length,
    totalLength: cables.reduce((sum, c) => sum + parseFloat(c.length || 0), 0)
  };

  // Generar PDF/Imprimir
  const generateReport = () => {
    const printWindow = window.open('', '_blank');
    const reportHTML = `...`;
    printWindow.document.write(reportHTML);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Modo Demo:</strong> Esta es una versión de demostración desplegada en GitHub Pages.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <FileText className="text-blue-600" />
              Generador de Reportes de Certificación (Demo)
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Upload size={20} />
                Importar CSV
              </button>
              <button
                onClick={generateReport}
                disabled={cables.length === 0}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <Download size={20} />
                Generar Reporte
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Nombre del Proyecto"
              value={project.name}
              onChange={(e) => setProject({...project, name: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Ingeniero Responsable"
              value={project.engineer}
              onChange={(e) => setProject({...project, engineer: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="date"
              value={project.date.split('/').reverse().join('-')}
              onChange={(e) => setProject({...project, date: new Date(e.target.value).toLocaleDateString('es-ES')})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Referencia Equipos"
              value={project.equipment}
              onChange={(e) => setProject({...project, equipment: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoApp;
