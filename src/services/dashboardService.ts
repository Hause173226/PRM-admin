import api from './api';
import {
  DashboardResponse,
  OrdersChartResponse,
  RevenueChartApiResponse,
} from '../types/dashboard';

export const dashboardService = {
  getOverview: async (): Promise<DashboardResponse> => {
    const response = await api.get<DashboardResponse>('/api/dashboard/overview');
    return response.data;
  },

  getOrdersChart: async (): Promise<OrdersChartResponse> => {
    const response = await api.get<OrdersChartResponse>('/api/dashboard/orders-chart');
    return response.data;
  },

  getRevenueChart: async (
    startDate?: string,
    endDate?: string
  ): Promise<RevenueChartApiResponse> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const url = `/api/dashboard/revenue-chart${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get<RevenueChartApiResponse>(url);
    return response.data;
  },
};
