export interface User {
  _id: string;
  email: string;
  password: string;
  role: 'admin' | 'cliente';
  createdAt: Date;
}

export interface Conversation {
  _id: string;
  userId: string;
  startedAt: Date;
  endedAt?: Date;
  status: 'active' | 'closed';
  messages: string[];
}

export interface Message {
  _id: string;
  conversationId: string;
  userId: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  intent: 'comprar' | 'precios' | 'soporte' | null;
}

export interface Log {
  _id: string;
  userId: string;
  action: 'login' | 'message' | 'error';
  timestamp: Date;
  details: any;
}

export interface PredefinedResponse {
  _id: string;
  intent: 'comprar' | 'precios' | 'soporte';
  response: string;
  editable: boolean;
  updatedAt: Date;
}