import React, { useState, useRef } from 'react';
import { Plus, Download, Upload, Trash2, Check, X, FileText, BarChart3, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

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

  const handleAddCable = () => {
    if (newCable.label && newCable.destination && newCable.length) {
      setCables(prev => [...prev, { ...newCable, id: prev.length + 1 }]);
      setNewCable({
        label: '',
        result: true,
        destination: '',
        networkType: 'Cat. 6A',
        length: ''
      });
    }
  };

  const handleDeleteCable = (id) => {
    setCables(prev => prev.filter(cable => cable.id !== id));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileType = file.name.split('.').pop().toLowerCase();

    if (fileType === 'csv') {
      Papa.parse(file, {
        complete: (results) => {
          const newCables = results.data
            .filter((row, index) => index > 0 && row.length >= 5) // Skip header row
            .map((row, index) => ({
              id: cables.length + index + 1,
              label: row[0],
              destination: row[1],
              networkType: row[2],
              length: row[3],
              result: row[4]?.toLowerCase() === 'true' || row[4]?.toLowerCase() === 'pass'
            }));
          setCables(prev => [...prev, ...newCables]);
        },
        header: false
      });
    } else if (fileType === 'xlsx' || fileType === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        const newCables = jsonData
          .filter((row, index) => index > 0 && row.length >= 5) // Skip header row
          .map((row, index) => ({
            id: cables.length + index + 1,
            label: row[0],
            destination: row[1],
            networkType: row[2],
            length: row[3],
            result: String(row[4]).toLowerCase() === 'true' || String(row[4]).toLowerCase() === 'pass'
          }));
        setCables(prev => [...prev, ...newCables]);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleExport = () => {
    const workbook = XLSX.utils.book_new();
    const data = [
      ['Etiqueta', 'Destino', 'Tipo de Red', 'Longitud', 'Resultado'], // Header
      ...cables.map(cable => [
        cable.label,
        cable.destination,
        cable.networkType,
        cable.length,
        cable.result ? 'PASS' : 'FAIL'
      ])
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cables');
    
    // Guardar el archivo
    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `certificacion_cables_${date}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <div className="space-x-4">
              <button className="btn-primary" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Importar
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
                accept=".csv,.xlsx"
              />
              <button className="btn-primary" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <p><strong>Ingeniero:</strong> {project.engineer}</p>
              <p><strong>Fecha:</strong> {project.date}</p>
            </div>
            <div>
              <p><strong>Hora:</strong> {project.time}</p>
              <p><strong>Equipo:</strong> {project.equipment}</p>
            </div>
          </div>
        </header>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Cables Certificados</h2>
            <div className="grid grid-cols-6 gap-4 mb-4">
              <input
                type="text"
                placeholder="Etiqueta"
                className="input"
                value={newCable.label}
                onChange={e => setNewCable(prev => ({ ...prev, label: e.target.value }))}
              />
              <input
                type="text"
                placeholder="Destino"
                className="input"
                value={newCable.destination}
                onChange={e => setNewCable(prev => ({ ...prev, destination: e.target.value }))}
              />
              <select
                className="input"
                value={newCable.networkType}
                onChange={e => setNewCable(prev => ({ ...prev, networkType: e.target.value }))}
              >
                <option>Cat. 6A</option>
                <option>Cat. 6</option>
                <option>Cat. 5e</option>
              </select>
              <input
                type="number"
                placeholder="Longitud (m)"
                className="input"
                value={newCable.length}
                onChange={e => setNewCable(prev => ({ ...prev, length: e.target.value }))}
              />
              <div className="col-span-2">
                <button className="btn-primary w-full" onClick={handleAddCable}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Cable
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-th">Estado</th>
                  <th className="table-th">Etiqueta</th>
                  <th className="table-th">Destino</th>
                  <th className="table-th">Tipo de Red</th>
                  <th className="table-th">Longitud (m)</th>
                  <th className="table-th">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cables.map(cable => (
                  <tr key={cable.id}>
                    <td className="table-td">
                      {cable.result ? (
                        <div className="status-success">
                          <Check className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="status-error">
                          <X className="w-5 h-5" />
                        </div>
                      )}
                    </td>
                    <td className="table-td">{cable.label}</td>
                    <td className="table-td">{cable.destination}</td>
                    <td className="table-td">{cable.networkType}</td>
                    <td className="table-td">{cable.length}</td>
                    <td className="table-td">
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDeleteCable(cable.id)}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .btn-primary {
          @apply inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200;
        }
        .input {
          @apply mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-colors duration-200;
        }
        .table-th {
          @apply px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 first:rounded-tl-lg last:rounded-tr-lg;
        }
        .table-td {
          @apply px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b border-gray-200;
        }
        select.input {
          @apply pr-8 cursor-pointer;
        }
        button:disabled {
          @apply opacity-50 cursor-not-allowed;
        }
        .table-container {
          @apply rounded-lg border border-gray-200 overflow-hidden;
        }
        .status-success {
          @apply text-green-600 bg-green-50 rounded-full p-1;
        }
        .status-error {
          @apply text-red-600 bg-red-50 rounded-full p-1;
        }
      `}</style>
    </div>
  );
};

export default DemoApp;