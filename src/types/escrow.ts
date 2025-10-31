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

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  phone: string;
}

export interface ProductInfo {
  id: string;
  name: string;
  brand: string;
  type: string;
  capacity: string;
  condition: string;
  year: number;
  price: number;
  voltage: string;
  cycleCount: number;
  location: string;
  warranty: string;
  status: string;
  images: string[];
  description: string;
  ownerId: string;
}

export interface TimelineEvent {
  fromStatus: string;
  toStatus: string;
  updatedById: string;
  updatedBy: string;
  updatedAt: string;
}

export interface OrderInfo {
  id: string;
  product: ProductInfo;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: string;
  shippingAddress: string;
  notes: string;
  status: string;
  buyer: UserInfo;
  seller: UserInfo;
  timeline: TimelineEvent[];
}

export interface Escrow {
  id: string;
  orderId: string;
  order?: OrderInfo;
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

