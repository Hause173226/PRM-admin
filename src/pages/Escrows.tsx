import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
  Shield, 
  Search, 
  Eye,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Escrow } from '../types/escrow';
import escrowService from '../services/escrowService';
import Toast, { ToastType } from '../components/Toast';

export default function Escrows() {
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEscrow, setSelectedEscrow] = useState<Escrow | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [releaseReason, setReleaseReason] = useState('');
  const [releasing, setReleasing] = useState(false);

  useEffect(() => {
    fetchEscrows();
  }, [statusFilter]);

  const fetchEscrows = async () => {
    setLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const response = await escrowService.getAllEscrows(params);
      setEscrows(response.data || []);
    } catch (error) {
      console.error('Error fetching escrows:', error);
      setEscrows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (escrowId: string) => {
    try {
      const escrow = await escrowService.getEscrowById(escrowId);
      setSelectedEscrow(escrow);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching escrow detail:', error);
      setToast({ message: 'Có lỗi xảy ra khi tải chi tiết escrow!', type: 'error' });
    }
  };

  const handleReleaseEscrow = async () => {
    if (!selectedEscrow) return;
    
    setReleasing(true);
    try {
      await escrowService.releaseEscrow(selectedEscrow.id, releaseReason);
      setToast({ message: 'Đã giải phóng escrow thành công!', type: 'success' });
      setShowReleaseModal(false);
      setShowDetailModal(false);
      setReleaseReason('');
      fetchEscrows(); // Refresh list
    } catch (error) {
      console.error('Error releasing escrow:', error);
      setToast({ message: 'Có lỗi xảy ra khi giải phóng escrow!', type: 'error' });
    } finally {
      setReleasing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      HOLDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Đang giữ' },
      RELEASED: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Đã giải phóng' },
      REFUNDED: { color: 'bg-blue-100 text-blue-800', icon: DollarSign, label: 'Đã hoàn tiền' },
      DISPUTED: { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Tranh chấp' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.HOLDING;
    const Icon = config.icon;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color} flex items-center gap-1 w-fit`}>
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  const filteredEscrows = (escrows || []).filter(escrow => {
    if (!escrow) return false;
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      escrow.id.toLowerCase().includes(searchLower) ||
      escrow.orderId.toLowerCase().includes(searchLower) ||
      escrow.buyerId.toLowerCase().includes(searchLower) ||
      escrow.sellerId.toLowerCase().includes(searchLower) ||
      (escrow.order?.buyer?.name || '').toLowerCase().includes(searchLower) ||
      (escrow.order?.buyer?.email || '').toLowerCase().includes(searchLower) ||
      (escrow.order?.seller?.name || '').toLowerCase().includes(searchLower) ||
      (escrow.order?.seller?.email || '').toLowerCase().includes(searchLower);
    
    return matchesSearch;
  });

  const totalAmount = filteredEscrows.reduce((sum, escrow) => sum + escrow.amountTotal, 0);
  const heldAmount = filteredEscrows
    .filter(e => e.status === 'HOLDING')
    .reduce((sum, escrow) => sum + escrow.amountHold, 0);

  return (
    <Layout>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Escrow</h1>
              <p className="text-gray-600">Quản lý và theo dõi tiền ký quỹ trên nền tảng</p>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl">
                <Shield className="text-blue-600" size={20} />
                <span className="text-sm font-medium text-blue-600">
                  Đang giữ: {heldAmount.toLocaleString('vi-VN')} đ
                </span>
              </div>
              <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-xl">
                <DollarSign className="text-green-600" size={20} />
                <span className="text-sm font-medium text-green-600">
                  Tổng: {totalAmount.toLocaleString('vi-VN')} đ
                </span>
              </div>
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
                placeholder="Tìm kiếm theo tên, email người mua/bán..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="HOLDING">Đang giữ</option>
                <option value="RELEASED">Đã giải phóng</option>
                <option value="REFUNDED">Đã hoàn tiền</option>
                <option value="DISPUTED">Tranh chấp</option>
              </select>
            </div>
          </div>
        </div>

        {/* Escrows Table */}
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
                        Người mua
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Người bán
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Số tiền
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Trạng thái
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
                    {filteredEscrows && filteredEscrows.length > 0 ? (
                      filteredEscrows.map((escrow) => (
                        <tr key={escrow.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {escrow.order?.buyer?.name || 'N/A'}
                            </div>
                            {escrow.order?.buyer?.email && (
                              <div className="text-xs text-gray-500">{escrow.order.buyer.email}</div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {escrow.order?.seller?.name || 'N/A'}
                            </div>
                            {escrow.order?.seller?.email && (
                              <div className="text-xs text-gray-500">{escrow.order.seller.email}</div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-gray-900">
                              {escrow.amountTotal.toLocaleString('vi-VN')} {escrow.currency}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(escrow.status)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {new Date(escrow.createdAt).toLocaleDateString('vi-VN')}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center">
                              <button
                                onClick={() => handleViewDetail(escrow.id)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Xem chi tiết"
                              >
                                <Eye size={20} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <Shield className="text-gray-400 mb-3" size={48} />
                            <p className="text-gray-500 text-lg font-medium">Không có escrow nào</p>
                            <p className="text-gray-400 text-sm mt-1">Thử thay đổi bộ lọc hoặc tìm kiếm</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Hiển thị {filteredEscrows.length} escrow
                </div>
              </div>
            </>
          )}
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedEscrow && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Chi tiết Escrow</h3>
              
              <div className="space-y-4">
                {/* Escrow Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Trạng thái</p>
                    {getStatusBadge(selectedEscrow.status)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ngày tạo</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedEscrow.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>

                {/* Product Info */}
                {selectedEscrow.order?.product && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Thông tin sản phẩm</h4>
                    
                    {/* Product Image */}
                    {selectedEscrow.order?.product.images && selectedEscrow.order.product.images.length > 0 && (
                      <div className="mb-4">
                        <img 
                          src={selectedEscrow.order.product.images[0]} 
                          alt={selectedEscrow.order.product.name}
                          className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => {
                            if (selectedEscrow.order?.product.images[0]) {
                              setSelectedImage(selectedEscrow.order.product.images[0]);
                              setShowImageModal(true);
                            }
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Tên sản phẩm</p>
                        <p className="font-semibold text-gray-900">{selectedEscrow.order.product.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Thương hiệu</p>
                        <p className="font-semibold text-gray-900">{selectedEscrow.order.product.brand}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Giá sản phẩm</p>
                        <p className="font-semibold text-gray-900">
                          {selectedEscrow.order.product.price.toLocaleString('vi-VN')} VND
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Phí vận chuyển</p>
                        <p className="font-semibold text-gray-900">
                          {selectedEscrow.order.shippingFee.toLocaleString('vi-VN')} VND
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Phương thức thanh toán</p>
                        <p className="font-semibold text-gray-900">{selectedEscrow.order.paymentMethod}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Địa chỉ giao hàng</p>
                        <p className="font-semibold text-gray-900">{selectedEscrow.order.shippingAddress}</p>
                      </div>
                    </div>
                    {selectedEscrow.order.notes && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600">Ghi chú</p>
                        <p className="font-semibold text-gray-900">{selectedEscrow.order.notes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Buyer & Seller Info */}
                {selectedEscrow.order && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Thông tin người mua & người bán</h4>
                    <div className="grid grid-cols-2 gap-6">
                      {selectedEscrow.order.buyer && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-xs text-blue-600 font-semibold mb-2">NGƯỜI MUA</p>
                          <div className="space-y-1">
                            <p className="font-semibold text-gray-900">{selectedEscrow.order.buyer.name}</p>
                            <p className="text-sm text-gray-600">{selectedEscrow.order.buyer.email}</p>
                            {selectedEscrow.order.buyer.phone && (
                              <p className="text-sm text-gray-600">{selectedEscrow.order.buyer.phone}</p>
                            )}
                          </div>
                        </div>
                      )}
                      {selectedEscrow.order.seller && (
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-xs text-green-600 font-semibold mb-2">NGƯỜI BÁN</p>
                          <div className="space-y-1">
                            <p className="font-semibold text-gray-900">{selectedEscrow.order.seller.name}</p>
                            <p className="text-sm text-gray-600">{selectedEscrow.order.seller.email}</p>
                            {selectedEscrow.order.seller.phone && (
                              <p className="text-sm text-gray-600">{selectedEscrow.order.seller.phone}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Amount Info */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Thông tin số tiền</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Tổng số tiền</p>
                      <p className="font-semibold text-green-600 text-lg">
                        {selectedEscrow.amountTotal.toLocaleString('vi-VN')} {selectedEscrow.currency}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Số tiền đang giữ</p>
                      <p className="font-semibold text-yellow-600 text-lg">
                        {selectedEscrow.amountHold.toLocaleString('vi-VN')} {selectedEscrow.currency}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Thông tin thanh toán</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Nhà cung cấp</p>
                      <p className="font-semibold text-gray-900">{selectedEscrow.payment.provider}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Intent ID</p>
                      <p className="font-semibold text-gray-900 text-xs break-all">{selectedEscrow.payment.paymentIntentId}</p>
                    </div>
                    {selectedEscrow.payment.authorizedAt && (
                      <div>
                        <p className="text-sm text-gray-600">Thời gian ủy quyền</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(selectedEscrow.payment.authorizedAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    )}
                    {selectedEscrow.payment.capturedAt && (
                      <div>
                        <p className="text-sm text-gray-600">Thời gian giữ tiền</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(selectedEscrow.payment.capturedAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    )}
                    {selectedEscrow.payment.refundedAt && (
                      <div>
                        <p className="text-sm text-gray-600">Thời gian hoàn tiền</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(selectedEscrow.payment.refundedAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Events */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Lịch sử sự kiện</h4>
                  <div className="space-y-2">
                    {selectedEscrow.events.map((event, index) => (
                      <div key={index} className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{event.description}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(event.at).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                {selectedEscrow.status === 'HOLDING' && (
                  <button
                    onClick={() => setShowReleaseModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Giải phóng escrow
                  </button>
                )}
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

        {/* Image Modal */}
        {showImageModal && selectedImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={() => setShowImageModal(false)}
          >
            <div className="relative max-w-4xl max-h-[90vh] p-4">
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-6 right-6 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <img 
                src={selectedImage} 
                alt="Product"
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}

        {/* Release Confirmation Modal */}
        {showReleaseModal && selectedEscrow && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Xác nhận giải phóng Escrow</h3>
              
              <div className="mb-4">
                <p className="text-gray-600 mb-2">
                  Bạn có chắc chắn muốn giải phóng escrow này?
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Số tiền <span className="font-semibold text-green-600">
                    {selectedEscrow.amountHold.toLocaleString('vi-VN')} {selectedEscrow.currency}
                  </span> sẽ được chuyển cho người bán.
                </p>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lý do (tùy chọn)
                  </label>
                  <textarea
                    value={releaseReason}
                    onChange={(e) => setReleaseReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={3}
                    placeholder="Nhập lý do giải phóng escrow..."
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowReleaseModal(false);
                    setReleaseReason('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={releasing}
                >
                  Hủy
                </button>
                <button
                  onClick={handleReleaseEscrow}
                  disabled={releasing}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {releasing ? 'Đang xử lý...' : 'Xác nhận giải phóng'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

