import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLogin from './components/AuthLogin';
import AuthRegister from './components/AuthRegister';
import ChatWindow from './components/ChatWindow';
import HistoryPanel from './components/HistoryPanel';
import QuickButtons from './components/QuickButtons';
import AdminPanel from './components/AdminPanel';
import { useAuth } from './hooks/useAuth';

function App() {
  const { getToken } = useAuth();

  const getRoleFromToken = (token: string | null): string | null => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role;
    } catch {
      return null;
    }
  };

  const isAdmin = getRoleFromToken(getToken()) === 'admin';

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<ChatWindow />} />
        <Route path="/login" element={<AuthLogin />} />
        <Route path="/register" element={<AuthRegister />} />
        <Route path="/admin" element={isAdmin ? <AdminPanel /> : <Navigate to="/login" />} />
        <Route path="/history/:userId" element={<HistoryPanel />} />
      </Routes>
    </div>
  );
}

export default App;