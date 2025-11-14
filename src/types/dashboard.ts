// Dashboard Overview Types

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  growthData: GrowthDataPoint[];
}

export interface GrowthDataPoint {
  date: string;
  count: number;
}

export interface ProductStats {
  totalProducts: number;
  publishedProducts: number;
  pendingProducts: number;
  soldProducts: number;
  draftProducts: number;
  rejectedProducts: number;
  statusBreakdown: StatusBreakdown[];
  topProducts: TopProduct[];
}

export interface StatusBreakdown {
  status: string;
  count: number;
  percentage: number;
}

export interface TopProduct {
  id: string;
  name: string;
  price: number;
  viewCount: number;
}

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalOrderValue: number;
  averageOrderValue: number;
  trendData: TrendDataPoint[];
}

export interface TrendDataPoint {
  date: string;
  count: number;
  amount: number;
}

export interface WalletStats {
  totalWallets: number;
  totalBalance: number;
  totalTransactions: number;
  totalDeposits: number;
  totalWithdrawals: number;
  todayTransactions: number;
  transactionTrends: TrendDataPoint[];
}

export interface RevenueStats {
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  yearRevenue: number;
  totalRevenue: number;
  chartData: RevenueChartData[];
}

export interface RevenueChartData {
  period: string;
  revenue: number;
  orderCount: number;
}

export interface DashboardOverview {
  users: UserStats;
  products: ProductStats;
  orders: OrderStats;
  wallets: WalletStats;
  revenue: RevenueStats;
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardOverview;
  timestamp: string;
}

// Orders Chart Types
export interface OrdersChartDatasets {
  totalOrders: number[];
  totalAmount: number[];
  deliveredOrders: number[];
  deliveredRevenue: number[];
  pendingOrders: number[];
  processingOrders: number[];
  cancelledOrders: number[];
}

export interface OrdersChartSummary {
  totalOrders: number;
  totalAmount: number;
  deliveredOrders: number;
  deliveredRevenue: number;
}

export interface OrdersChartDateRange {
  startDate: string;
  endDate: string;
}

export interface OrdersChartData {
  labels: string[];
  datasets: OrdersChartDatasets;
  summary: OrdersChartSummary;
  dateRange: OrdersChartDateRange;
}

export interface OrdersChartResponse {
  success: boolean;
  data: OrdersChartData;
}

// Revenue Chart Types
export interface RevenueChartApiData {
  labels: string[];
  revenue: number[];
  orderCounts: number[];
  totalRevenue: number;
  totalOrders: number;
  startDate: string;
  endDate: string;
}

export interface RevenueChartApiResponse {
  success: boolean;
  data: RevenueChartApiData;
}
