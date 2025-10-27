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
  XCircle,
  Truck
} from 'lucide-react';
import { Order } from '../types/order';
import orderService from '../services/orderService';

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
  const pageSize = 10;

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await orderService.getAllOrders(currentPage, pageSize);
      setOrders(response.data || []);
      setTotalPages(response.totalPages || 1);
      setTotalOrders(response.total || 0);
    } catch (error) {
      console.error('Error fetching orders:', error);
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
      alert('Vui lòng chọn trạng thái!');
      return;
    }

    try {
      await orderService.updateOrderStatus(selectedOrder.id, { 
        status: newStatus as Order['status']
      });
      setShowStatusModal(false);
      fetchOrders();
      alert('Cập nhật trạng thái thành công!');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái!');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Chờ xử lý' },
      processing: { color: 'bg-blue-100 text-blue-800', icon: Package, label: 'Đang xử lý' },
      shipped: { color: 'bg-purple-100 text-purple-800', icon: Truck, label: 'Đang giao' },
      delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Đã giao' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Đã hủy' },
      completed: { color: 'bg-teal-100 text-teal-800', icon: CheckCircle, label: 'Hoàn thành' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color} flex items-center gap-1 w-fit`}>
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      refunded: 'bg-gray-100 text-gray-800',
    };

    const labels = {
      pending: 'Chờ thanh toán',
      paid: 'Đã thanh toán',
      refunded: 'Đã hoàn tiền',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const filteredOrders = (orders || []).filter(order => {
    if (!order) return false;
    
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.buyerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.sellerId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !selectedStatus || order.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Đơn hàng</h1>
              <p className="text-gray-600">Quản lý và theo dõi đơn hàng trên nền tảng</p>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl">
              <ShoppingCart className="text-blue-600" size={20} />
              <span className="text-sm font-medium text-blue-600">Tổng: {totalOrders} đơn hàng</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm theo ID đơn hàng, buyer, seller..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="pending">Chờ xử lý</option>
                <option value="processing">Đang xử lý</option>
                <option value="shipped">Đang giao</option>
                <option value="delivered">Đã giao</option>
                <option value="cancelled">Đã hủy</option>
                <option value="completed">Hoàn thành</option>
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
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Mã đơn
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Sản phẩm
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Số lượng
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Tổng tiền
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Thanh toán
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Ngày tạo
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredOrders && filteredOrders.length > 0 ? (
                      filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">#{order.id.slice(0, 8)}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">ID: {order.productId.slice(0, 8)}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{order.quantity}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-gray-900">
                              {order.totalPrice.toLocaleString('vi-VN')} đ
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(order.status)}
                          </td>
                          <td className="px-6 py-4">
                            {getPaymentStatusBadge(order.paymentStatus)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleViewDetail(order)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Xem chi tiết"
                              >
                                <Eye size={20} />
                              </button>
                              <button
                                onClick={() => handleStatusChangeClick(order)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Cập nhật trạng thái"
                              >
                                <Edit size={20} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <ShoppingCart className="text-gray-400 mb-3" size={48} />
                            <p className="text-gray-500 text-lg font-medium">Không có đơn hàng nào</p>
                            <p className="text-gray-400 text-sm mt-1">Thử thay đổi bộ lọc hoặc tìm kiếm</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Hiển thị {filteredOrders.length} / {totalOrders} đơn hàng
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Trước
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-600">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Sau
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Chi tiết đơn hàng</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Mã đơn hàng</p>
                    <p className="font-semibold text-gray-900">#{selectedOrder.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ngày tạo</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Buyer ID</p>
                    <p className="font-semibold text-gray-900">{selectedOrder.buyerId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Seller ID</p>
                    <p className="font-semibold text-gray-900">{selectedOrder.sellerId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Product ID</p>
                    <p className="font-semibold text-gray-900">{selectedOrder.productId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Số lượng</p>
                    <p className="font-semibold text-gray-900">{selectedOrder.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tổng tiền</p>
                    <p className="font-semibold text-green-600 text-lg">
                      {selectedOrder.totalPrice.toLocaleString('vi-VN')} đ
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Trạng thái</p>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Địa chỉ giao hàng</p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900">{selectedOrder.shippingAddress.street}</p>
                    <p className="text-gray-900">
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}
                    </p>
                    <p className="text-gray-900">
                      {selectedOrder.shippingAddress.country} - {selectedOrder.shippingAddress.zipCode}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Change Modal */}
        {showStatusModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Cập nhật trạng thái đơn hàng</h3>
              <p className="text-sm text-gray-600 mb-4">
                Đơn hàng: <span className="font-semibold">#{selectedOrder.id.slice(0, 8)}</span>
              </p>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="pending">Chờ xử lý</option>
                <option value="processing">Đang xử lý</option>
                <option value="shipped">Đang giao</option>
                <option value="delivered">Đã giao</option>
                <option value="cancelled">Đã hủy</option>
                <option value="completed">Hoàn thành</option>
              </select>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleStatusUpdate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Cập nhật
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

