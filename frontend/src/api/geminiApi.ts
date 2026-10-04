import apiClient from './axios';

export interface ChatMessage {
  id?: string;
  role: 'user' | 'model' | 'assistant';
  content: string;
  modelUsed?: string;
  groundingSources?: Array<{ title: string; url: string }>;
  webSearchQueries?: string[];
  timestamp?: string;
}

export interface CoachRole {
  id: string;
  name: string;
  modelDefault: string;
  description: string;
  systemInstruction: string;
}

export const geminiApi = {
  sendMessage: async (data: {
    messages: Array<{ role: string; content: string }>;
    role?: string;
    taskType?: 'general' | 'complex' | 'fast';
    enableSearchGrounding?: boolean;
    customSystemInstruction?: string;
  }) => {
    const res = await apiClient.post('/gemini/chat', data);
    return res.data;
  },

  getCoachRoles: async () => {
    const res = await apiClient.get('/gemini/roles');
    return res.data;
  },
};
