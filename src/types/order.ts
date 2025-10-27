export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  productId: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrderResponse {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpdateOrderStatusRequest {
  status: Order['status'];
}

