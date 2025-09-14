import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Conversation, PredefinedResponse } from '../../../shared/types';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'conversations' | 'responses'>('metrics');
  const [metrics, setMetrics] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [responses, setResponses] = useState<PredefinedResponse[]>([]);
  const [editingResponse, setEditingResponse] = useState<PredefinedResponse | null>(null);

  useEffect(() => {
    if (activeTab === 'metrics') {
      fetchMetrics();
    } else if (activeTab === 'conversations') {
      fetchConversations();
    } else if (activeTab === 'responses') {
      fetchResponses();
    }
  }, [activeTab]);

  const fetchMetrics = async () => {
    try {
      const response = await axios.get('/admin/metrics');
      setMetrics(response.data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await axios.get('/admin/conversations');
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchResponses = async () => {
    try {
      const response = await axios.get('/admin/predefined');
      setResponses(response.data);
    } catch (error) {
      console.error('Error fetching responses:', error);
    }
  };

  const updateResponse = async (id: string, updatedResponse: Partial<PredefinedResponse>) => {
    try {
      await axios.put(`/admin/predefined/${id}`, updatedResponse);
      fetchResponses();
      setEditingResponse(null);
    } catch (error) {
      console.error('Error updating response:', error);
    }
  };

  const renderMetrics = () => {
    if (!metrics) return <div>Loading...</div>;

    const barData = {
      labels: metrics.intents.map((i: any) => i.intent),
      datasets: [{
        label: 'Interacciones por intención',
        data: metrics.intents.map((i: any) => i.count),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      }],
    };

    const lineData = {
      labels: metrics.daily.map((d: any) => d.date),
      datasets: [{
        label: 'Uso diario',
        data: metrics.daily.map((d: any) => d.count),
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
      }],
    };

    return (
      <div>
        <h3>Métricas</h3>
        <div className="chart-container">
          <Bar data={barData} />
        </div>
        <div className="chart-container">
          <Line data={lineData} />
        </div>
      </div>
    );
  };

  const renderConversations = () => (
    <div>
      <h3>Conversaciones Recientes</h3>
      <ul>
        {conversations.map((conv) => (
          <li key={conv._id}>
            Usuario: {conv.userId}, Estado: {conv.status}, Mensajes: {conv.messages.length}
          </li>
        ))}
      </ul>
    </div>
  );

  const renderResponses = () => (
    <div>
      <h3>Editar Respuestas Predefinidas</h3>
      {responses.map((resp) => (
        <div key={resp._id}>
          <p>Intención: {resp.intent}</p>
          <p>Respuesta: {resp.response}</p>
          <button onClick={() => setEditingResponse(resp)}>Editar</button>
        </div>
      ))}
      {editingResponse && (
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          updateResponse(editingResponse._id, { response: formData.get('response') as string });
        }}>
          <textarea name="response" defaultValue={editingResponse.response} />
          <button type="submit">Actualizar</button>
          <button onClick={() => setEditingResponse(null)}>Cancelar</button>
        </form>
      )}
    </div>
  );

  return (
    <div className="admin-panel">
      <div className="tabs">
        <button onClick={() => setActiveTab('metrics')}>Métricas</button>
        <button onClick={() => setActiveTab('conversations')}>Conversaciones</button>
        <button onClick={() => setActiveTab('responses')}>Editar Respuestas</button>
      </div>
      <div className="tab-content">
        {activeTab === 'metrics' && renderMetrics()}
        {activeTab === 'conversations' && renderConversations()}
        {activeTab === 'responses' && renderResponses()}
      </div>
    </div>
  );
};

export default AdminPanel;