import Layout from '../components/Layout';
import DateRangePicker, { DateRangePreset } from '../components/DateRangePicker';
import { Users, FileText, DollarSign, CheckCircle, Award, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import { DashboardOverview, RevenueChartApiData, OrdersChartData } from '../types/dashboard';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardOverview | null>(null);
  const [revenueChartData, setRevenueChartData] = useState<RevenueChartApiData | null>(null);
  const [ordersChartData, setOrdersChartData] = useState<OrdersChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  
  const [startDate, setStartDate] = useState<Date | null>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 6);
    return date;
  });
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [datePreset, setDatePreset] = useState<DateRangePreset>('last7days');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchChartData();
    }
  }, [startDate, endDate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getOverview();
      setDashboardData(response.data);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    if (!startDate || !endDate) return;

    try {
      setChartLoading(true);
      const [revenueResponse, ordersResponse] = await Promise.all([
        dashboardService.getRevenueChart(startDate.toISOString(), endDate.toISOString()),
        dashboardService.getOrdersChart(),
      ]);
      setRevenueChartData(revenueResponse.data);
      setOrdersChartData(ordersResponse.data);
    } catch (error: any) {
      console.error('Error fetching chart data:', error);
      toast.error('Không thể tải dữ liệu biểu đồ');
    } finally {
      setChartLoading(false);
    }
  };

  const handleDateChange = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const calculateGrowth = (data: { date: string; count: number }[]) => {
    if (data.length < 2) return 0;
    const recent = data.slice(-3).reduce((sum, d) => sum + d.count, 0);
    const previous = data.slice(-6, -3).reduce((sum, d) => sum + d.count, 0);
    if (previous === 0) return recent > 0 ? 100 : 0;
    return ((recent - previous) / previous) * 100;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
      </Layout>
    );
  }

  if (!dashboardData) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">Không có dữ liệu</p>
        </div>
      </Layout>
    );
  }

  const userGrowth = calculateGrowth(dashboardData.users.growthData);
  const orderGrowth = calculateGrowth(dashboardData.orders.trendData.map(t => ({ date: t.date, count: t.count })));

  const stats = [
    {
      icon: Users,
      label: 'Người dùng',
      value: formatNumber(dashboardData.users.totalUsers),
      change: `${userGrowth >= 0 ? '+' : ''}${userGrowth.toFixed(1)}%`,
      isPositive: userGrowth >= 0,
      color: 'blue'
    },
    {
      icon: FileText,
      label: 'Tin đăng',
      value: formatNumber(dashboardData.products.totalProducts),
      change: `${dashboardData.products.publishedProducts} đã xuất bản`,
      isPositive: true,
      color: 'green'
    },
    {
      icon: DollarSign,
      label: 'Doanh thu tháng',
      value: formatPrice(dashboardData.revenue.monthRevenue),
      change: `Tổng: ${formatPrice(dashboardData.revenue.totalRevenue)}`,
      isPositive: true,
      color: 'purple'
    },
    {
      icon: CheckCircle,
      label: 'Đơn hàng',
      value: formatNumber(dashboardData.orders.totalOrders),
      change: `${orderGrowth >= 0 ? '+' : ''}${orderGrowth.toFixed(1)}%`,
      isPositive: orderGrowth >= 0,
      color: 'orange'
    }
  ];

  const publishedPercentage = dashboardData.products.totalProducts > 0
    ? (dashboardData.products.publishedProducts / dashboardData.products.totalProducts) * 100
    : 0;
  const otherPercentage = 100 - publishedPercentage;

  const listingTypes = [
    { name: 'Đã xuất bản', value: publishedPercentage, color: 'bg-blue-600' },
    { name: 'Khác', value: otherPercentage, color: 'bg-gray-400' }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between animate-slide-down">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Tổng quan</h1>
            <p className="text-gray-600 mt-1">Thống kê và báo cáo về hoạt động nền tảng</p>
          </div>
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onDateChange={handleDateChange}
            preset={datePreset}
            onPresetChange={setDatePreset}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const colorClasses = {
              blue: { bg: 'bg-gradient-to-br from-blue-100 to-blue-50', icon: 'text-blue-600', border: 'border-blue-200/50' },
              green: { bg: 'bg-gradient-to-br from-green-100 to-green-50', icon: 'text-green-600', border: 'border-green-200/50' },
              purple: { bg: 'bg-gradient-to-br from-purple-100 to-purple-50', icon: 'text-purple-600', border: 'border-purple-200/50' },
              orange: { bg: 'bg-gradient-to-br from-orange-100 to-orange-50', icon: 'text-orange-600', border: 'border-orange-200/50' }
            };
            const colors = colorClasses[stat.color as keyof typeof colorClasses];
            
            return (
              <div key={index} className="glass-effect rounded-2xl border border-slate-200/50 p-6 card-hover shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-14 h-14 ${colors.bg} rounded-2xl flex items-center justify-center shadow-md border ${colors.border}`}>
                    <Icon className={colors.icon} size={26} />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-semibold px-3 py-1.5 rounded-full ${
                    stat.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {stat.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {stat.change}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">{stat.value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-effect rounded-2xl border border-slate-200/50 p-6 shadow-lg card-hover">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-800">Doanh thu theo thời gian</h2>
              <p className="text-sm text-gray-500 mt-1">
                {startDate && endDate && `${startDate.toLocaleDateString('vi-VN')} - ${endDate.toLocaleDateString('vi-VN')}`}
              </p>
            </div>
            {chartLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={32} />
              </div>
            ) : revenueChartData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Tổng doanh thu</p>
                    <p className="text-xl font-bold text-gray-900">{formatPrice(revenueChartData.totalRevenue)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Tổng đơn hàng</p>
                    <p className="text-xl font-bold text-gray-900">{formatNumber(revenueChartData.totalOrders)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Trung bình/đơn</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatPrice(revenueChartData.totalOrders > 0 ? revenueChartData.totalRevenue / revenueChartData.totalOrders : 0)}
                    </p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  {revenueChartData.labels.length > 0 ? (
                    <div className="space-y-2">
                      {revenueChartData.labels.map((label, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{label}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-gray-900 font-medium">{formatPrice(revenueChartData.revenue[index])}</span>
                            <span className="text-gray-500">({revenueChartData.orderCounts[index]} đơn)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-400 py-8">Không có dữ liệu trong khoảng thời gian này</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-400">Chọn khoảng thời gian để xem dữ liệu</p>
              </div>
            )}
          </div>

          <div className="glass-effect rounded-2xl border border-slate-200/50 p-6 shadow-lg card-hover">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Loại tin đăng</h2>
            <div className="space-y-6">
              <div className="relative w-48 h-48 mx-auto">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="20"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="20"
                    strokeDasharray={`${listingTypes[0].value * 2.51} ${(100 - listingTypes[0].value) * 2.51}`}
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="20"
                    strokeDasharray={`${listingTypes[1].value * 2.51} ${(100 - listingTypes[1].value) * 2.51}`}
                    strokeDashoffset={`${-listingTypes[0].value * 2.51}`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900">{formatNumber(dashboardData.products.totalProducts)}</p>
                    <p className="text-sm text-gray-600">Tổng tin</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {listingTypes.map((type, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded ${type.color}`}></div>
                      <span className="text-gray-700">{type.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{type.value.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-effect rounded-2xl border border-slate-200/50 p-6 shadow-lg card-hover">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Thống kê đơn hàng</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tổng đơn hàng</span>
                <span className="font-semibold text-gray-900">{formatNumber(dashboardData.orders.totalOrders)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Đang chờ</span>
                <span className="font-semibold text-yellow-600">{formatNumber(dashboardData.orders.pendingOrders)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Hoàn thành</span>
                <span className="font-semibold text-green-600">{formatNumber(dashboardData.orders.completedOrders)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Đã hủy</span>
                <span className="font-semibold text-red-600">{formatNumber(dashboardData.orders.cancelledOrders)}</span>
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Giá trị trung bình</span>
                  <span className="font-semibold text-blue-600">{formatPrice(dashboardData.orders.averageOrderValue)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-effect rounded-2xl border border-slate-200/50 p-6 shadow-lg card-hover">
            <div className="flex items-center gap-2 mb-6">
              <Award className="text-primary-600" size={22} />
              <h2 className="text-lg font-bold text-gray-800">Ví điện tử</h2>
            </div>
            <div className="space-y-4">
              <div className="text-center py-4">
                <p className="text-sm text-gray-600 mb-2">Tổng số dư</p>
                <p className="text-3xl font-bold text-gray-900">{formatPrice(dashboardData.wallets.totalBalance)}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Tổng ví</p>
                  <p className="text-xl font-bold text-gray-900">{formatNumber(dashboardData.wallets.totalWallets)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">GD hôm nay</p>
                  <p className="text-xl font-bold text-gray-900">{formatNumber(dashboardData.wallets.todayTransactions)}</p>
                </div>
              </div>
              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tổng nạp tiền</span>
                  <span className="font-semibold text-green-600">{formatPrice(dashboardData.wallets.totalDeposits)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tổng rút tiền</span>
                  <span className="font-semibold text-red-600">{formatPrice(dashboardData.wallets.totalWithdrawals)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
