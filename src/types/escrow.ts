export interface Escrow {
  id: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  status: 'held' | 'released' | 'refunded' | 'disputed';
  createdAt: string;
  updatedAt: string;
  releaseDate?: string;
  notes?: string;
}

export interface EscrowResponse {
  data: Escrow[];
  total: number;
}

