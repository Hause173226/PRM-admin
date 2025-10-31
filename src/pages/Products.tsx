import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
  Package, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Eye,
  X,
} from 'lucide-react';
import { Product, ProductFilters } from '../types/product';
import { 
  getAllProducts, 
  getProductById,
  approveProduct, 
  rejectProduct
} from '../services/productService';
import Toast, { ToastType } from '../components/Toast';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedVoltage, setSelectedVoltage] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedWarranty, setSelectedWarranty] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productDetail, setProductDetail] = useState<Product | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const pageSize = 10;

  useEffect(() => {
    fetchProducts();
  }, [currentPage, selectedStatus, selectedType, selectedBrand, selectedVoltage, selectedLocation, selectedWarranty]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const filters: ProductFilters = {
        page: currentPage,
        pageSize: pageSize,
      };

      // Chỉ thêm filter khi có giá trị (không phải rỗng)
      if (selectedStatus) filters.status = selectedStatus;
      if (selectedType) filters.type = selectedType;
      if (selectedBrand) filters.brand = selectedBrand;
      if (selectedVoltage) filters.voltage = selectedVoltage;
      if (selectedLocation) filters.location = selectedLocation;
      if (selectedWarranty) filters.warranty = selectedWarranty;

      console.log('📤 Fetching products with filters:', filters);
      const response = await getAllProducts(filters);
      console.log('📥 API Response:', response);
      
      setProducts(response.items || []);
      // Tính totalPages từ total và pageSize
      const calculatedTotalPages = response.total > 0 
        ? Math.ceil(response.total / response.pageSize) 
        : 1;
      setTotalPages(response.totalPages || calculatedTotalPages);
      setTotalProducts(response.total || 0);
    } catch (error) {
      console.error('❌ Error fetching products:', error);
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
      setToast({ message: 'Sản phẩm đã được duyệt thành công!', type: 'success' });
    } catch (error) {
      console.error('Error approving product:', error);
      setToast({ message: 'Có lỗi xảy ra khi duyệt sản phẩm!', type: 'error' });
    }
  };

  const handleRejectClick = (product: Product) => {
    setSelectedProduct(product);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!selectedProduct || !rejectReason.trim()) {
      setToast({ message: 'Vui lòng nhập lý do từ chối!', type: 'error' });
      return;
    }

    try {
      await rejectProduct(selectedProduct.id, { reason: rejectReason });
      setShowRejectModal(false);
      fetchProducts();
      setToast({ message: 'Sản phẩm đã được từ chối!', type: 'success' });
    } catch (error) {
      console.error('Error rejecting product:', error);
      setToast({ message: 'Có lỗi xảy ra khi từ chối sản phẩm!', type: 'error' });
    }
  };

  const handleViewDetail = async (productId: string) => {
    setShowDetailModal(true);
    setLoadingDetail(true);
    setProductDetail(null);
    
    try {
      const detail = await getProductById(productId);
      setProductDetail(detail);
    } catch (error) {
      console.error('Error fetching product detail:', error);
      setToast({ message: 'Có lỗi xảy ra khi tải chi tiết sản phẩm!', type: 'error' });
      setShowDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Published: 'bg-green-100 text-green-800',
      InTransaction: 'bg-blue-100 text-blue-800',
      Sold: 'bg-purple-100 text-purple-800',
      Expired: 'bg-gray-100 text-gray-800',
      Rejected: 'bg-red-100 text-red-800',
    };

    const statusLabels = {
      Pending: 'Chờ duyệt',
      Published: 'Đã đăng',
      InTransaction: 'Đang giao dịch',
      Sold: 'Đã bán',
      Expired: 'Hết hạn',
      Rejected: 'Từ chối',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800'}`}>
        {statusLabels[status as keyof typeof statusLabels] || status}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                <option value="Published">Đã đăng</option>
                <option value="InTransaction">Đang giao dịch</option>
                <option value="Sold">Đã bán</option>
                <option value="Expired">Hết hạn</option>
                <option value="Rejected">Từ chối</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
          >
            <Filter size={16} />
            {showAdvancedFilters ? 'Ẩn bộ lọc nâng cao' : 'Hiển thị bộ lọc nâng cao'}
          </button>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
              <div className="relative">
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  value={selectedBrand}
                  onChange={(e) => {
                    setSelectedBrand(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">Tất cả thương hiệu</option>
                  <option value="Samsung">Samsung</option>
                  <option value="LG">LG</option>
                  <option value="Panasonic">Panasonic</option>
                  <option value="BYD">BYD</option>
                  <option value="CATL">CATL</option>
                </select>
              </div>

              <div className="relative">
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  value={selectedVoltage}
                  onChange={(e) => {
                    setSelectedVoltage(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">Tất cả điện áp</option>
                  <option value="48V">48V</option>
                  <option value="60V">60V</option>
                  <option value="72V">72V</option>
                </select>
              </div>

              <div className="relative">
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  value={selectedLocation}
                  onChange={(e) => {
                    setSelectedLocation(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">Tất cả vị trí</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                  <option value="Hải Phòng">Hải Phòng</option>
                </select>
              </div>

              <div className="relative">
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  value={selectedWarranty}
                  onChange={(e) => {
                    setSelectedWarranty(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">Tất cả bảo hành</option>
                  <option value="3 tháng">3 tháng</option>
                  <option value="6 tháng">6 tháng</option>
                  <option value="12 tháng">12 tháng</option>
                  <option value="24 tháng">24 tháng</option>
                </select>
              </div>
            </div>
          )}
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
                              <button
                                onClick={() => handleViewDetail(product.id)}
                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                title="Xem chi tiết"
                              >
                                <Eye size={20} />
                              </button>
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
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
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

        {/* Product Detail Modal */}
        {showDetailModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Chi tiết sản phẩm</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {loadingDetail ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                  </div>
                ) : productDetail ? (
                  <div className="space-y-6">
                    {/* Images Section */}
                    {productDetail.images && productDetail.images.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-lg font-semibold text-gray-900">Hình ảnh</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {productDetail.images.map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`Product ${index + 1}`}
                              className="w-full h-48 object-cover rounded-lg border border-gray-200"
                              onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/300x200?text=No+Image';
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900">Thông tin cơ bản</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Tên sản phẩm:</span>
                            <span className="font-medium text-gray-900">{productDetail.name || `${productDetail.brand} ${productDetail.voltage}`}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Loại:</span>
                            <span className="font-medium text-gray-900">{productDetail.type}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Thương hiệu:</span>
                            <span className="font-medium text-gray-900">{productDetail.brand}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Trạng thái:</span>
                            <span>{getStatusBadge(productDetail.status)}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Kiểu niêm yết:</span>
                            <span className="font-medium text-gray-900">
                              {productDetail.listingType === 'FixedPrice' ? 'Giá cố định' : 'Đấu giá'}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Giá:</span>
                            <span className="font-semibold text-purple-600 text-lg">
                              {productDetail.price ? productDetail.price.toLocaleString('vi-VN') : '0'} đ
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900">Thông số kỹ thuật</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Điện áp:</span>
                            <span className="font-medium text-gray-900">{productDetail.voltage}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Dung lượng:</span>
                            <span className="font-medium text-gray-900">{productDetail.capacity}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Số chu kỳ:</span>
                            <span className="font-medium text-gray-900">{productDetail.cycleCount} cycles</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Tình trạng:</span>
                            <span className="font-medium text-gray-900">{productDetail.condition}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Năm sản xuất:</span>
                            <span className="font-medium text-gray-900">{productDetail.year}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">SOH:</span>
                            <span className="font-medium text-gray-900">
                              {productDetail.soh !== null ? `${productDetail.soh}%` : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Location & Warranty */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="text-lg font-semibold text-gray-900">Vị trí & Bảo hành</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">📍 Vị trí:</span>
                            <span className="font-medium text-gray-900">{productDetail.location}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">🛡️ Bảo hành:</span>
                            <span className="font-medium text-gray-900">{productDetail.warranty}</span>
                          </div>
                        </div>
                      </div>

                      {productDetail.seller && (
                        <div className="space-y-3">
                          <h4 className="text-lg font-semibold text-gray-900">Người bán</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-gray-600">Tên:</span>
                              <span className="font-medium text-gray-900">{productDetail.seller.name}</span>
                            </div>
                            {productDetail.seller.email && (
                              <div className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-600">Email:</span>
                                <span className="font-medium text-gray-900">{productDetail.seller.email}</span>
                              </div>
                            )}
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-gray-600">ID:</span>
                              <span className="font-medium text-gray-900 text-sm">{productDetail.seller.id}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {productDetail.description && (
                      <div className="space-y-3">
                        <h4 className="text-lg font-semibold text-gray-900">Mô tả</h4>
                        <p className="text-gray-700 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                          {productDetail.description}
                        </p>
                      </div>
                    )}

                    {/* Rejection Reason */}
                    {productDetail.status === 'Rejected' && productDetail.rejectionReason && (
                      <div className="space-y-3">
                        <h4 className="text-lg font-semibold text-red-600">Lý do từ chối</h4>
                        <p className="text-gray-700 bg-red-50 border border-red-200 p-4 rounded-lg">
                          {productDetail.rejectionReason}
                        </p>
                      </div>
                    )}

                    {/* Timestamps */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
                      {productDetail.createdAt && (
                        <div className="flex justify-between py-2">
                          <span className="text-gray-600">Ngày tạo:</span>
                          <span className="font-medium text-gray-900">
                            {new Date(productDetail.createdAt).toLocaleString('vi-VN')}
                          </span>
                        </div>
                      )}
                      {productDetail.updatedAt && (
                        <div className="flex justify-between py-2">
                          <span className="text-gray-600">Cập nhật lần cuối:</span>
                          <span className="font-medium text-gray-900">
                            {new Date(productDetail.updatedAt).toLocaleString('vi-VN')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Không tìm thấy thông tin sản phẩm</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
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


