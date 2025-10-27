export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  createdAt: string;
  readAt?: string;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: ChatMessage;
  createdAt: string;
  updatedAt: string;
  unreadCount: number;
}

export interface ChatDetail extends Chat {
  messages: ChatMessage[];
}

export interface ChatResponse {
  data: Chat[];
  total: number;
}

