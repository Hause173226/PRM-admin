import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Eye,
  Edit,
  Package,
  Clock,
  CheckCircle,
  Truck,
  MapPin,
  User,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  TrendingUp,
  FileText,
  X
} from 'lucide-react';
import { Order } from '../types/order';
import orderService from '../services/orderService';
import Toast, { ToastType } from '../components/Toast';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const pageSize = 10;

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await orderService.getAllOrders(currentPage, pageSize);
      setOrders(response.items || []);
      setTotalPages(response.totalPages || 1);
      setTotalOrders(response.total || 0);
    } catch (error) {
      setToast({ message: 'Không thể tải danh sách đơn hàng', type: 'error' });
      setOrders([]);
      setTotalPages(1);
      setTotalOrders(0);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleStatusChangeClick = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setShowStatusModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) {
      setToast({ message: 'Vui lòng chọn trạng thái!', type: 'error' });
      return;
    }

    try {
      await orderService.updateOrderStatus(selectedOrder.id, { 
        status: newStatus as Order['status']
      });
      setShowStatusModal(false);
      fetchOrders();
      setToast({ message: 'Cập nhật trạng thái thành công!', type: 'success' });
    } catch (error) {
      setToast({ message: 'Có lỗi xảy ra khi cập nhật trạng thái!', type: 'error' });
    }
  };

  const getStatusLabel = (status: string) => {
    const statusLabels: { [key: string]: string } = {
      'None': 'Không có',
      'Pending': 'Chờ xử lý',
      'Confirmed': 'Đã xác nhận',
      'Processing': 'Đang xử lý',
      'Shipped': 'Đang giao',
    };
    return statusLabels[status] || status;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      Pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock, label: 'Chờ xử lý' },
      Confirmed: { color: 'bg-cyan-100 text-cyan-800 border-cyan-200', icon: CheckCircle, label: 'Đã xác nhận' },
      Processing: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Package, label: 'Đang xử lý' },
      Shipped: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Truck, label: 'Đang giao' },
    };
    console.log(status);
    console.log(statusConfig);
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Pending;
    const Icon = config.icon;

    return (
      <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${config.color} border flex items-center gap-1.5 w-fit`}>
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  const getOrderStats = () => {
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'Pending').length,
      confirmed: orders.filter(o => o.status === 'Confirmed').length,
      processing: orders.filter(o => o.status === 'Processing').length,
      shipped: orders.filter(o => o.status === 'Shipped').length,
      totalRevenue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
    };
    return stats;
  };

  const filteredOrders = (orders || []).filter(order => {
    if (!order) return false;
    
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.buyer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.buyer?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.seller?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.seller?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !selectedStatus || order.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const stats = getOrderStats();

  return (
    <Layout>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Quản lý Đơn hàng</h1>
              <p className="text-sm md:text-base text-gray-600">Quản lý và theo dõi đơn hàng trên nền tảng</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <ShoppingCart className="text-blue-600" size={20} />
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-1">Tổng đơn</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900">{totalOrders}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Clock className="text-yellow-600" size={20} />
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-1">Chờ xử lý</p>
            <p className="text-xl md:text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-cyan-50 rounded-lg">
                <CheckCircle className="text-cyan-600" size={20} />
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-1">Đã xác nhận</p>
            <p className="text-xl md:text-2xl font-bold text-cyan-600">{stats.confirmed}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Package className="text-blue-600" size={20} />
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-1">Đang xử lý</p>
            <p className="text-xl md:text-2xl font-bold text-blue-600">{stats.processing}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Truck className="text-purple-600" size={20} />
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-1">Đang giao</p>
            <p className="text-xl md:text-2xl font-bold text-purple-600">{stats.shipped}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-4 text-white hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-white/20 rounded-lg">
                <DollarSign size={20} />
              </div>
            </div>
            <p className="text-xs text-green-50 mb-1">Doanh thu</p>
            <p className="text-lg md:text-xl font-bold truncate">{stats.totalRevenue.toLocaleString('vi-VN')}đ</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Tìm kiếm theo mã đơn, tên người mua/bán, email, sản phẩm..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer transition-all"
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="Pending">Chờ xử lý</option>
                <option value="Confirmed">Đã xác nhận</option>
                <option value="Processing">Đang xử lý</option>
                <option value="Shipped">Đang giao</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Mã đơn & Sản phẩm
                      </th>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                        Người mua
                      </th>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                        Người bán
                      </th>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Tổng tiền
                      </th>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-4 md:px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredOrders && filteredOrders.length > 0 ? (
                      filteredOrders.map((order) => (
                        <tr 
                          key={order.id} 
                          className="hover:bg-blue-50/50 transition-all duration-200 group"
                        >
                          <td className="px-4 md:px-6 py-4">
                            <div className="flex items-center gap-3">
                              {order.product?.images?.[0] && (
                                <div className="relative">
                                  <img 
                                    src={order.product.images[0]} 
                                    alt={order.product.name}
                                    className="w-12 h-12 md:w-14 md:h-14 rounded-lg object-cover border-2 border-gray-200 group-hover:border-blue-400 transition-colors"
                                  />
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="text-xs text-gray-500 mb-0.5 font-mono">
                                  #{order.id.slice(-8)}
                                </div>
                                <div className="text-sm font-semibold text-gray-900 truncate">
                                  {order.product?.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {order.product?.brand} • {order.product?.capacity}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 md:px-6 py-4 hidden md:table-cell">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <User size={14} className="text-blue-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {order.buyer?.name}
                                </div>
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <Mail size={10} />
                                  {order.buyer?.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 md:px-6 py-4 hidden lg:table-cell">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                <User size={14} className="text-green-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {order.seller?.name}
                                </div>
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <Mail size={10} />
                                  {order.seller?.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 md:px-6 py-4">
                            <div className="text-sm font-bold text-gray-900">
                              {order.totalAmount.toLocaleString('vi-VN')}đ
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Truck size={10} />
                              Ship: {order.shippingFee.toLocaleString('vi-VN')}đ
                            </div>
                            <div className="text-xs text-blue-600 font-medium mt-1">
                              {order.paymentMethod}
                            </div>
                          </td>
                          <td className="px-4 md:px-6 py-4">
                            {getStatusBadge(order.status)}
                          </td>
                          <td className="px-4 md:px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleViewDetail(order)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all hover:scale-110"
                                title="Xem chi tiết"
                              >
                                <Eye size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                              <ShoppingCart className="text-gray-400" size={40} />
                            </div>
                            <p className="text-gray-600 text-lg font-semibold mb-1">Không có đơn hàng nào</p>
                            <p className="text-gray-400 text-sm">Thử thay đổi bộ lọc hoặc tìm kiếm</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-4 md:px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="text-xs md:text-sm text-gray-600 font-medium">
                  Hiển thị <span className="text-blue-600 font-bold">{filteredOrders.length}</span> / <span className="font-bold">{totalOrders}</span> đơn hàng
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 md:px-4 py-2 border border-gray-300 rounded-lg hover:bg-white hover:border-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
                  >
                    ← Trước
                  </button>
                  <span className="px-3 md:px-4 py-2 text-xs md:text-sm bg-blue-50 text-blue-700 rounded-lg font-semibold border border-blue-200">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 md:px-4 py-2 border border-gray-300 rounded-lg hover:bg-white hover:border-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
                  >
                    Sau →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-5 rounded-t-2xl flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    <FileText size={28} />
                    Chi tiết đơn hàng
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleStatusChangeClick(selectedOrder);
                    }}
                    className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all font-semibold flex items-center gap-2 shadow-lg"
                  >
                    <Edit size={18} />
                    Cập nhật trạng thái
                  </button>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6">

                {/* Quick Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <p className="text-xs text-blue-600 font-semibold mb-1">Trạng thái</p>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                    <p className="text-xs text-purple-600 font-semibold mb-1">Thanh toán</p>
                    <p className="font-bold text-purple-900 text-lg">{selectedOrder.paymentMethod}</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                    <p className="text-xs text-orange-600 font-semibold mb-1 flex items-center gap-1">
                      <Truck size={12} />
                      Phí vận chuyển
                    </p>
                    <p className="font-bold text-orange-900 text-lg">
                      {selectedOrder.shippingFee.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                    <p className="text-xs text-green-600 font-semibold mb-1 flex items-center gap-1">
                      <DollarSign size={12} />
                      Tổng tiền
                    </p>
                    <p className="font-bold text-green-900 text-xl">
                      {selectedOrder.totalAmount.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                </div>

                {/* Product Info */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="text-blue-600" size={20} />
                    Thông tin sản phẩm
                  </h4>
                  <div className="flex flex-col md:flex-row gap-5">
                    {selectedOrder.product?.images?.[0] && (
                      <div className="flex-shrink-0">
                        <img 
                          src={selectedOrder.product.images[0]} 
                          alt={selectedOrder.product.name}
                          className="w-full md:w-32 h-32 rounded-xl object-cover border-2 border-gray-300 shadow-md"
                        />
                      </div>
                    )}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Tên sản phẩm</p>
                        <p className="font-semibold text-gray-900">{selectedOrder.product?.name}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Thương hiệu</p>
                        <p className="font-semibold text-gray-900">{selectedOrder.product?.brand}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Loại</p>
                        <p className="font-semibold text-gray-900">{selectedOrder.product?.type}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Dung lượng</p>
                        <p className="font-semibold text-gray-900">{selectedOrder.product?.capacity}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Điện áp</p>
                        <p className="font-semibold text-gray-900">{selectedOrder.product?.voltage}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Giá sản phẩm</p>
                        <p className="font-semibold text-green-600 text-lg">
                          {selectedOrder.product?.price.toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Buyer and Seller Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {/* Buyer Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border-2 border-blue-200">
                    <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <User className="text-white" size={20} />
                      </div>
                      Người mua
                    </h4>
                    <div className="space-y-3 bg-white rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <User className="text-blue-600 mt-1 flex-shrink-0" size={16} />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">Tên</p>
                          <p className="font-semibold text-gray-900">{selectedOrder.buyer?.name}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Mail className="text-blue-600 mt-1 flex-shrink-0" size={16} />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="font-semibold text-gray-900 text-sm break-all">{selectedOrder.buyer?.email}</p>
                        </div>
                      </div>
                      {selectedOrder.buyer?.phone && (
                        <div className="flex items-start gap-3">
                          <Phone className="text-blue-600 mt-1 flex-shrink-0" size={16} />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Số điện thoại</p>
                            <p className="font-semibold text-gray-900">{selectedOrder.buyer.phone}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Seller Card */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border-2 border-green-200">
                    <h4 className="font-bold text-green-900 mb-4 flex items-center gap-2">
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                        <User className="text-white" size={20} />
                      </div>
                      Người bán
                    </h4>
                    <div className="space-y-3 bg-white rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <User className="text-green-600 mt-1 flex-shrink-0" size={16} />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">Tên</p>
                          <p className="font-semibold text-gray-900">{selectedOrder.seller?.name}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Mail className="text-green-600 mt-1 flex-shrink-0" size={16} />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="font-semibold text-gray-900 text-sm break-all">{selectedOrder.seller?.email}</p>
                        </div>
                      </div>
                      {selectedOrder.seller?.phone && (
                        <div className="flex items-start gap-3">
                          <Phone className="text-green-600 mt-1 flex-shrink-0" size={16} />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Số điện thoại</p>
                            <p className="font-semibold text-gray-900">{selectedOrder.seller.phone}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="mt-6 bg-orange-50 rounded-xl p-5 border-2 border-orange-200">
                  <h4 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
                    <MapPin className="text-orange-600" size={20} />
                    Địa chỉ giao hàng
                  </h4>
                  <div className="bg-white p-4 rounded-lg border border-orange-100">
                    <p className="text-gray-900 leading-relaxed">{selectedOrder.shippingAddress}</p>
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div className="mt-6 bg-amber-50 rounded-xl p-5 border-2 border-amber-200">
                    <h4 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                      <FileText className="text-amber-600" size={20} />
                      Ghi chú
                    </h4>
                    <div className="bg-white p-4 rounded-lg border border-amber-100">
                      <p className="text-gray-900 leading-relaxed italic">{selectedOrder.notes}</p>
                    </div>
                  </div>
                )}

                {/* Timeline */}
                {selectedOrder.timeline && selectedOrder.timeline.length > 0 && (
                  <div className="mt-6 bg-indigo-50 rounded-xl p-5 border-2 border-indigo-200">
                    <h4 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                      <TrendingUp className="text-indigo-600" size={20} />
                      Lịch sử đơn hàng
                    </h4>
                    <div className="space-y-3">
                      {selectedOrder.timeline.map((event, index) => (
                        <div key={index} className="flex gap-4 items-start bg-white rounded-lg p-4 border border-indigo-100">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900 text-sm">
                                  {getStatusLabel(event.fromStatus)}
                                </span>
                                <span className="text-gray-400">→</span>
                                <span className="font-bold text-indigo-600 text-sm">
                                  {getStatusLabel(event.toStatus)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Calendar size={12} />
                                {new Date(event.updatedAt).toLocaleString('vi-VN')}
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                              <User size={12} />
                              Cập nhật bởi: <span className="font-semibold">{event.updatedBy}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

        {/* Status Change Modal */}
        {showStatusModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-5 rounded-t-2xl">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <Edit size={24} />
                  Cập nhật trạng thái
                </h3>
                <p className="text-green-100 text-sm mt-1">
                  Đơn hàng: <span className="font-mono font-semibold">#{selectedOrder.id.slice(-8)}</span>
                </p>
              </div>

              <div className="p-6">
                {/* Current Status */}
                <div className="mb-6 bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 mb-2 font-semibold">Trạng thái hiện tại:</p>
                  {getStatusBadge(selectedOrder.status)}
                </div>

                {/* Status Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Chọn trạng thái mới:
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'Pending', label: 'Chờ xử lý', icon: Clock, color: 'yellow' },
                      { value: 'Confirmed', label: 'Đã xác nhận', icon: CheckCircle, color: 'cyan' },
                      { value: 'Processing', label: 'Đang xử lý', icon: Package, color: 'blue' },
                      { value: 'Shipped', label: 'Đang giao', icon: Truck, color: 'purple' },
                    ].map((status) => {
                      const Icon = status.icon;
                      const isSelected = newStatus === status.value;
                      const colorClasses = {
                        yellow: 'border-yellow-500 bg-yellow-50',
                        cyan: 'border-cyan-500 bg-cyan-50',
                        blue: 'border-blue-500 bg-blue-50',
                        purple: 'border-purple-500 bg-purple-50',
                      };
                      return (
                        <button
                          key={status.value}
                          onClick={() => setNewStatus(status.value)}
                          className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                            isSelected
                              ? `${colorClasses[status.color as keyof typeof colorClasses]} shadow-md`
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            isSelected ? `bg-${status.color}-100` : 'bg-gray-100'
                          }`}>
                            <Icon size={24} className={isSelected ? `text-${status.color}-600` : 'text-gray-400'} />
                          </div>
                          <div className="text-left flex-1">
                            <p className={`font-bold ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                              {status.label}
                            </p>
                            <p className="text-xs text-gray-500">
                              {status.value === selectedOrder.status && '(Hiện tại)'}
                            </p>
                          </div>
                          {isSelected && (
                            <CheckCircle size={20} className={`text-${status.color}-600`} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleStatusUpdate}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all font-semibold shadow-lg"
                  >
                    Xác nhận
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

