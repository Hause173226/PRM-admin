import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
  Shield, 
  Search, 
  Eye,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Escrow } from '../types/escrow';
import escrowService from '../services/escrowService';
import toast, { Toaster } from 'react-hot-toast';

export default function Escrows() {
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewType, setViewType] = useState<'all' | 'buyer' | 'seller'>('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEscrow, setSelectedEscrow] = useState<Escrow | null>(null);

  useEffect(() => {
    fetchEscrows();
  }, [viewType]);

  const fetchEscrows = async () => {
    setLoading(true);
    try {
      let response;
      if (viewType === 'buyer') {
        response = await escrowService.getBuyerEscrows();
      } else if (viewType === 'seller') {
        response = await escrowService.getSellerEscrows();
      } else {
        // For 'all', we'll fetch both and combine (you might need to adjust this based on your API)
        const buyerResponse = await escrowService.getBuyerEscrows();
        const sellerResponse = await escrowService.getSellerEscrows();
        const combined = [...(buyerResponse.data || []), ...(sellerResponse.data || [])];
        // Remove duplicates based on ID
        const uniqueEscrows = combined.filter((escrow, index, self) =>
          index === self.findIndex((e) => e.id === escrow.id)
        );
        setEscrows(uniqueEscrows);
        setLoading(false);
        return;
      }
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
      toast.error('Có lỗi xảy ra khi tải chi tiết escrow!');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      held: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Đang giữ' },
      released: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Đã giải phóng' },
      refunded: { color: 'bg-blue-100 text-blue-800', icon: DollarSign, label: 'Đã hoàn tiền' },
      disputed: { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Tranh chấp' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.held;
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
    
    const matchesSearch = 
      escrow.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      escrow.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      escrow.buyerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      escrow.sellerId.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const totalAmount = filteredEscrows.reduce((sum, escrow) => sum + escrow.amount, 0);
  const heldAmount = filteredEscrows
    .filter(e => e.status === 'held')
    .reduce((sum, escrow) => sum + escrow.amount, 0);

  return (
    <Layout>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#363636',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
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
                placeholder="Tìm kiếm theo ID escrow, order, buyer, seller..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setViewType('all')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewType === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setViewType('buyer')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewType === 'buyer'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Buyer
              </button>
              <button
                onClick={() => setViewType('seller')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewType === 'seller'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Seller
              </button>
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
                        Mã Escrow
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Mã đơn hàng
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Buyer ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Seller ID
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
                            <div className="font-medium text-gray-900">#{escrow.id.slice(0, 8)}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">#{escrow.orderId.slice(0, 8)}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{escrow.buyerId.slice(0, 10)}...</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{escrow.sellerId.slice(0, 10)}...</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-gray-900">
                              {escrow.amount.toLocaleString('vi-VN')} đ
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
                        <td colSpan={8} className="px-6 py-12 text-center">
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
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Chi tiết Escrow</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Mã Escrow</p>
                    <p className="font-semibold text-gray-900">#{selectedEscrow.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Mã đơn hàng</p>
                    <p className="font-semibold text-gray-900">#{selectedEscrow.orderId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Buyer ID</p>
                    <p className="font-semibold text-gray-900">{selectedEscrow.buyerId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Seller ID</p>
                    <p className="font-semibold text-gray-900">{selectedEscrow.sellerId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Số tiền</p>
                    <p className="font-semibold text-green-600 text-lg">
                      {selectedEscrow.amount.toLocaleString('vi-VN')} đ
                    </p>
                  </div>
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
                  <div>
                    <p className="text-sm text-gray-600">Ngày cập nhật</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedEscrow.updatedAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  {selectedEscrow.releaseDate && (
                    <div>
                      <p className="text-sm text-gray-600">Ngày giải phóng</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(selectedEscrow.releaseDate).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  )}
                </div>

                {selectedEscrow.notes && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Ghi chú</p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-900">{selectedEscrow.notes}</p>
                    </div>
                  </div>
                )}
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
      </div>
    </Layout>
  );
}

