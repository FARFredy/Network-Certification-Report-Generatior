import { useState } from 'react';

export const useAuth = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  const login = async (email: string, password: string) => {
    // TODO: Implementar llamada a API para login
    // const response = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    // const data = await response.json();
    // if (data.token) {
    //   localStorage.setItem('token', data.token);
    //   setToken(data.token);
    // }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const getToken = () => token;

  return { login, logout, getToken };
};