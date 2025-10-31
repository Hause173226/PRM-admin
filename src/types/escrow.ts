export interface PaymentInfo {
  provider: string;
  paymentIntentId: string;
  authorizedAt: string | null;
  capturedAt: string | null;
  refundedAt: string | null;
}

export interface EscrowEvent {
  type: number;
  at: string;
  by: string | null;
  description: string;
  meta: any;
}

export interface Escrow {
  id: string;
  orderId: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  status: 'HOLDING' | 'RELEASED' | 'REFUNDED' | 'DISPUTED';
  amountTotal: number;
  amountHold: number;
  currency: string;
  payment: PaymentInfo;
  events: EscrowEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface EscrowResponse {
  success: boolean;
  data: Escrow[];
  count: number;
}

