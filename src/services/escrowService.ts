import api from './api';
import { Escrow, EscrowResponse } from '../types/escrow';

export const escrowService = {
  // Get all escrows with optional filters
  getAllEscrows: async (params?: { 
    status?: string;
    buyerId?: string;
    sellerId?: string;
    orderId?: string;
  }): Promise<EscrowResponse> => {
    const response = await api.get('/api/escrows', { params });
    return response.data;
  },

  // Get escrow by ID
  getEscrowById: async (id: string): Promise<Escrow> => {
    const response = await api.get(`/api/escrows/${id}`);
    return response.data.data || response.data;
  },

  // Release escrow
  releaseEscrow: async (id: string, reason?: string): Promise<Escrow> => {
    const response = await api.post(`/api/escrows/${id}/release`, { reason });
    return response.data.data || response.data;
  },
};

export default escrowService;

