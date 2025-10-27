// Re-export all types
export * from './auth';
export * from './user';
export * from './product';

export interface User {
  id: string;
  email: string;
  fullName: string;
  displayName: string | null;
  phone: string;
  avatarUrl: string;
  bio: string | null;
  address: string;
  role: 'Admin' | 'User' | 'Staff';
  isActive: boolean;
}

export interface Listing {
  id: string;
  title: string;
  type: 'vehicle' | 'battery';
  price: number;
  seller: {
    id: string;
    name: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  isCertified: boolean;
  images: string[];
  description: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  buyer: {
    id: string;
    name: string;
  };
  seller: {
    id: string;
    name: string;
  };
  product: {
    id: string;
    name: string;
  };
  amount: number;
  status: 'created' | 'paid' | 'shipping' | 'completed' | 'disputed';
  createdAt: string;
  timeline: {
    status: string;
    date: string;
    completed: boolean;
  }[];
}

export interface FeeConfig {
  id: string;
  type: string;
  percentage: number;
  lastUpdated: string;
  updatedBy: string;
}

export interface Stats {
  totalUsers: number;
  totalListings: number;
  revenue: number;
  completedTransactions: number;
  certifiedListings: number;
}
