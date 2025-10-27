import api from './api';
import { Chat, ChatDetail, ChatResponse } from '../types/chat';

export const chatService = {
  // Get all chats
  getAllChats: async (): Promise<ChatResponse> => {
    const response = await api.get('/api/chats');
    return response.data;
  },

  // Get chat detail by ID
  getChatById: async (id: string): Promise<ChatDetail> => {
    const response = await api.get(`/api/chats/${id}`);
    return response.data;
  },
};

export default chatService;

