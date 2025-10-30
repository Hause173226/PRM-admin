import api from './api';
import { 
  Product, 
  ProductFilters, 
  ProductListResponse,
  UpdateProductStatusRequest,
  ApproveProductRequest,
  RejectProductRequest
} from '../types/product';

// GET /api/products/admin - Xem tất cả sản phẩm (có filter theo status)
export const getAllProducts = async (filters?: ProductFilters): Promise<ProductListResponse> => {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
  }

  const response = await api.get<ProductListResponse>(`/api/products/admin?${params.toString()}`);
  return response.data;
};

// GET /api/products/{id} - Xem chi tiết sản phẩm
export const getProductById = async (productId: string): Promise<Product> => {
  try {
    const response = await api.get<Product>(`/api/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product details:', error);
    throw error;
  }
};

// PUT /api/products/{id}/approve - Duyệt sản phẩm
export const approveProduct = async (
  productId: string, 
  data?: ApproveProductRequest
): Promise<Product> => {
  try {
    const response = await api.put<Product>(`/api/products/${productId}/approve`, data || {});
    return response.data;
  } catch (error) {
    console.error('Error approving product:', error);
    throw error;
  }
};

// PUT /api/products/{id}/reject - Từ chối sản phẩm
export const rejectProduct = async (
  productId: string, 
  data: RejectProductRequest
): Promise<Product> => {
  try {
    const response = await api.put<Product>(`/api/products/${productId}/reject`, data);
    return response.data;
  } catch (error) {
    console.error('Error rejecting product:', error);
    throw error;
  }
};

// PUT /api/products/{id}/status - Cập nhật trạng thái bất kỳ sản phẩm
export const updateProductStatus = async (
  productId: string, 
  data: UpdateProductStatusRequest
): Promise<Product> => {
  try {
    const response = await api.put<Product>(`/api/products/${productId}/status`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating product status:', error);
    throw error;
  }
};

// Xuất tất cả functions
export default {
  getAllProducts,
  getProductById,
  approveProduct,
  rejectProduct,
  updateProductStatus,
};

