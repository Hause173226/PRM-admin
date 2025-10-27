import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
  Package, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Edit,

} from 'lucide-react';
import { Product, ProductFilters } from '../types/product';
import { 
  getAllProducts, 
  approveProduct, 
  rejectProduct, 
  updateProductStatus 
} from '../services/productService';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [newStatus, setNewStatus] = useState<string>('');
  const pageSize = 10;

  useEffect(() => {
    fetchProducts();
  }, [currentPage, selectedStatus, selectedType]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const filters: ProductFilters = {
        page: currentPage,
        pageSize: pageSize,
      };

      if (selectedStatus) {
        filters.status = selectedStatus;
      }

      if (selectedType) {
        filters.type = selectedType;
      }

      const response = await getAllProducts(filters);
      setProducts(response.data || []);
      setTotalPages(response.totalPages || 1);
      setTotalProducts(response.total || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setTotalPages(1);
      setTotalProducts(0);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (productId: string) => {
    try {
      await approveProduct(productId);
      fetchProducts();
      alert('Sản phẩm đã được duyệt thành công!');
    } catch (error) {
      console.error('Error approving product:', error);
      alert('Có lỗi xảy ra khi duyệt sản phẩm!');
    }
  };

  const handleRejectClick = (product: Product) => {
    setSelectedProduct(product);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!selectedProduct || !rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối!');
      return;
    }

    try {
      await rejectProduct(selectedProduct.id, { reason: rejectReason });
      setShowRejectModal(false);
      fetchProducts();
      alert('Sản phẩm đã được từ chối!');
    } catch (error) {
      console.error('Error rejecting product:', error);
      alert('Có lỗi xảy ra khi từ chối sản phẩm!');
    }
  };

  const handleStatusChangeClick = (product: Product) => {
    setSelectedProduct(product);
    setNewStatus(product.status);
    setShowStatusModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedProduct || !newStatus) {
      alert('Vui lòng chọn trạng thái!');
      return;
    }

    try {
      await updateProductStatus(selectedProduct.id, { 
        status: newStatus as 'Pending' | 'Approved' | 'Rejected' | 'Active' | 'Inactive'
      });
      setShowStatusModal(false);
      fetchProducts();
      alert('Cập nhật trạng thái thành công!');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái!');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Approved: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800',
      Active: 'bg-blue-100 text-blue-800',
      Inactive: 'bg-gray-100 text-gray-800',
      'Còn hàng': 'bg-green-100 text-green-800',
      'Hết hàng': 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const filteredProducts = (products || []).filter(product => {
    if (!product) return false;
    
    const matchesSearch = 
      (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.brand || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.seller?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Sản phẩm</h1>
              <p className="text-gray-600">Quản lý và kiểm duyệt sản phẩm trên nền tảng</p>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl">
              <Package className="text-blue-600" size={20} />
              <span className="text-sm font-medium text-blue-600">Tổng: {totalProducts} sản phẩm</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, loại, người bán..."
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
                <option value="Pending">Chờ duyệt</option>
                <option value="Approved">Đã duyệt</option>
                <option value="Rejected">Từ chối</option>
                <option value="Active">Hoạt động</option>
                <option value="Inactive">Không hoạt động</option>
              </select>
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Tất cả loại</option>
                <option value="battery">Pin</option>
                <option value="vehicle">Xe điện</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
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
                        Sản phẩm
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Thông số
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Tình trạng
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Vị trí
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Giá
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredProducts && filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {product.images && product.images.length > 0 ? (
                                <img 
                                  src={product.images[0]} 
                                  alt={product.name || product.brand}
                                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <div className={`w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center ${product.images && product.images.length > 0 ? 'hidden' : ''}`}>
                                <Package className="text-blue-600" size={24} />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{product.name || `${product.brand} ${product.voltage}`}</div>
                                <div className="text-sm text-gray-500">{product.brand} • {product.type}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm space-y-1">
                              <div className="text-gray-900">⚡ {product.voltage} • {product.capacity}</div>
                              <div className="text-gray-600">🔋 {product.cycleCount} cycles</div>
                              <div className="text-gray-600">📅 Năm {product.year}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm space-y-1">
                              <div className="text-gray-900">{product.condition}</div>
                              <div className="text-gray-600">🛡️ BH: {product.warranty}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">📍 {product.location}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-gray-900">
                              {product.price ? product.price.toLocaleString('vi-VN') : '0'} đ
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(product.status)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              {product.status === 'Pending' && (
                                <>
                                  <button
                                    onClick={() => handleApprove(product.id)}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Duyệt"
                                  >
                                    <CheckCircle size={20} />
                                  </button>
                                  <button
                                    onClick={() => handleRejectClick(product)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Từ chối"
                                  >
                                    <XCircle size={20} />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleStatusChangeClick(product)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Thay đổi trạng thái"
                              >
                                <Edit size={20} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <Package className="text-gray-400 mb-3" size={48} />
                            <p className="text-gray-500 text-lg font-medium">Không có sản phẩm nào</p>
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
                  Hiển thị {filteredProducts.length} / {totalProducts} sản phẩm
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

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Từ chối sản phẩm</h3>
              <p className="text-sm text-gray-600 mb-4">
                Sản phẩm: <span className="font-semibold">{selectedProduct?.name || selectedProduct?.brand}</span>
              </p>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
                rows={4}
                placeholder="Nhập lý do từ chối..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleRejectSubmit}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Xác nhận từ chối
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Change Modal */}
        {showStatusModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Cập nhật trạng thái</h3>
              <p className="text-sm text-gray-600 mb-4">
                Sản phẩm: <span className="font-semibold">{selectedProduct?.name || selectedProduct?.brand}</span>
              </p>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="Pending">Chờ duyệt</option>
                <option value="Approved">Đã duyệt</option>
                <option value="Rejected">Từ chối</option>
                <option value="Active">Hoạt động</option>
                <option value="Inactive">Không hoạt động</option>
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


