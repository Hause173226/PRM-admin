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
  status: 'Pending' | 'Published' | 'InTransaction' | 'Sold' | 'Expired' | 'Rejected';
  soh: number | null; // State of Health
  listingType: 'FixedPrice' | 'Auction';
  price: number;
  description?: string;
  images?: string[];
  ownerId?: string;
  rejectionReason?: string | null;
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
  capacity?: string;
  condition?: string;
  year?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export interface ProductListResponse {
  items: Product[]; // API trả về 'items' thay vì 'data'
  total: number;
  page: number;
  pageSize: number;
  totalPages?: number; // Optional vì API có thể không trả về
}

export interface UpdateProductStatusRequest {
  status: 'Pending' | 'Published' | 'InTransaction' | 'Sold' | 'Expired' | 'Rejected';
  reason?: string;
}

export interface ApproveProductRequest {
  notes?: string;
}

export interface RejectProductRequest {
  reason: string;
}

