export interface Product {
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

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
}

export interface TimelineEvent {
  fromStatus: string;
  toStatus: string;
  updatedById: string;
  updatedBy: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  product: Product;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: string;
  shippingAddress: string;
  notes: string;
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped';
  buyer: User;
  seller: User;
  timeline: TimelineEvent[];
}

export interface OrderResponse {
  items: Order[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UpdateOrderStatusRequest {
  status: Order['status'];
}

