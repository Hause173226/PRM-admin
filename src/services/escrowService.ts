import api from './api';
import { Escrow, EscrowResponse } from '../types/escrow';

export const escrowService = {
  // Get escrow by ID
  getEscrowById: async (id: string): Promise<Escrow> => {
    const response = await api.get(`/api/escrows/${id}`);
    return response.data;
  },

  // Get buyer escrows
  getBuyerEscrows: async (): Promise<EscrowResponse> => {
    const response = await api.get('/api/escrows/buyer');
    return response.data;
  },

  // Get seller escrows
  getSellerEscrows: async (): Promise<EscrowResponse> => {
    const response = await api.get('/api/escrows/seller');
    return response.data;
  },
};

export default escrowService;

