import api from './api';
import { Order, OrderResponse, UpdateOrderStatusRequest } from '../types/order';

export const orderService = {
  // Get all orders with pagination
  getAllOrders: async (page: number = 1, limit: number = 10): Promise<OrderResponse> => {
    const response = await api.get(`/api/orders?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get order by ID
  getOrderById: async (id: string): Promise<Order> => {
    const response = await api.get(`/api/orders/${id}`);
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (id: string, data: UpdateOrderStatusRequest): Promise<Order> => {
    const response = await api.put(`/api/orders/${id}`, data);
    return response.data;
  },
};

export default orderService;

