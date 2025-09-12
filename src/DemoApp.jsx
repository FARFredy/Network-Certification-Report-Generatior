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
    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reporte de Certificación - ${project.name}</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .project-info { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #000; padding: 8px; text-align: left; }
          th { background-color: #f0f0f0; font-weight: bold; }
          .pass { color: green; font-weight: bold; }
          .fail { color: red; font-weight: bold; }
          .footer { margin-top: 30px; border-top: 1px solid #ccc; padding-top: 10px; }
          .stats { background-color: #f9f9f9; padding: 15px; border-radius: 5px; }
          .demo-notice { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 5px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="demo-notice">
          <strong>📋 Modo Demo:</strong> Este reporte se genera localmente en tu navegador.
          Para funcionalidades completas, despliega con backend completo.
        </div>

        <div class="header">
          <h1>REPORTE DE CERTIFICACIÓN DE REDES</h1>
          <h2>${project.name}</h2>
        </div>

        <div class="project-info">
          <p><strong>Ingeniero:</strong> ${project.engineer}</p>
          <p><strong>Fecha:</strong> ${project.date} - ${project.time}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Etiqueta de cable</th>
              <th>Resultado</th>
              <th>Destino</th>
              <th>Redes</th>
              <th>Longitud</th>
            </tr>
          </thead>
          <tbody>
            ${cables.map(cable => `
              <tr>
                <td>${cable.label}</td>
                <td class="${cable.result ? 'pass' : 'fail'}">${cable.result ? '✓' : '✗'}</td>
                <td>${cable.destination}</td>
                <td>${cable.networkType}</td>
                <td>${cable.length} m.</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="stats">
          <h3>Totales Globales</h3>
          <p><strong>Cobre:</strong></p>
          <p>Pasar: ${stats.passed} | Fallar: ${stats.failed} | Longitud Total: ${stats.totalLength.toFixed(1)} m</p>
        </div>

        <div class="footer">
          <p><strong>Firma:</strong> ${project.engineer}</p>
          <p>Visite ${project.equipment} para obtener información acerca del equipo de prueba utilizado.</p>
          <p>Impreso ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}</p>
          <p><em>Generado en modo demo - GitHub Pages</em></p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(reportHTML);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Demo Notice */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Modo Demo:</strong> Esta es una versión de demostración desplegada en GitHub Pages.
                Los datos se almacenan localmente en tu navegador. Para funcionalidades completas,
                despliega con Docker que incluye backend y base de datos.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
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

          {/* Project Info */}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Cable Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Plus className="text-green-600" />
              Agregar Cable
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Etiqueta (ej: P11 PPA D4)"
                value={newCable.label}
                onChange={(e) => setNewCable({...newCable, label: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <select
                value={newCable.result}
                onChange={(e) => setNewCable({...newCable, result: e.target.value === 'true'})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={true}>✓ Aprobado</option>
                <option value={false}>✗ Falló</option>
              </select>

              <input
                type="text"
                placeholder="Destino (ej: D4)"
                value={newCable.destination}
                onChange={(e) => setNewCable({...newCable, destination: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <select
                value={newCable.networkType}
                onChange={(e) => setNewCable({...newCable, networkType: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Cat. 6A">Cat. 6A</option>
                <option value="Cat. 6">Cat. 6</option>
                <option value="Cat. 5e">Cat. 5e</option>
                <option value="Fibra Óptica">Fibra Óptica</option>
              </select>

              <input
                type="number"
                placeholder="Longitud (metros)"
                value={newCable.length}
                onChange={(e) => setNewCable({...newCable, length: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <button
                onClick={addCable}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Agregar Cable
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart3 className="text-purple-600" />
              Estadísticas
            </h2>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-gray-600">Total de Cables</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-xl font-bold text-green-600 flex items-center gap-1">
                    <Check size={20} />
                    {stats.passed}
                  </div>
                  <div className="text-sm text-gray-600">Aprobados</div>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-xl font-bold text-red-600 flex items-center gap-1">
                    <X size={20} />
                    {stats.failed}
                  </div>
                  <div className="text-sm text-gray-600">Fallaron</div>
                </div>
              </div>

              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="text-xl font-bold text-indigo-600">
                  {stats.totalLength.toFixed(1)} m
                </div>
                <div className="text-sm text-gray-600">Longitud Total</div>
              </div>
            </div>
          </div>

          {/* Cable List */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Cables Registrados ({cables.length})
            </h2>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {cables.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No hay cables registrados aún
                </p>
              ) : (
                cables.map((cable) => (
                  <div key={cable.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">
                        {cable.label} → {cable.destination}
                      </div>
                      <div className="text-sm text-gray-600">
                        {cable.networkType} • {cable.length}m
                        {cable.result ?
                          <span className="ml-2 text-green-600 font-medium">✓ Aprobado</span> :
                          <span className="ml-2 text-red-600 font-medium">✗ Falló</span>
                        }
                      </div>
                    </div>
                    <button
                      onClick={() => removeCable(cable.id)}
                      className="text-red-500 hover:bg-red-50 p-1 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={() => {}}
          accept=".csv"
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};

export default DemoApp;