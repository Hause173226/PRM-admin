// Product types and interfaces
export interface Product {
  id: string;
  name: string;
  type: string;
  brand: string;
  voltage: string;
  capacity: string;
  cycleCount: number;
  condition: string;
  year: number;
  location: string;
  warranty: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Active' | 'Inactive' | 'Còn hàng' | 'Hết hàng';
  price: number;
  description?: string;
  images?: string[];
  seller?: {
    id: string;
    name: string;
    email?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFilters {
  type?: string;
  brand?: string;
  voltage?: string;
  cycleCount?: number;
  location?: string;
  warranty?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface ProductListResponse {
  data: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UpdateProductStatusRequest {
  status: 'Pending' | 'Approved' | 'Rejected' | 'Active' | 'Inactive';
  reason?: string;
}

export interface ApproveProductRequest {
  notes?: string;
}

export interface RejectProductRequest {
  reason: string;
}

