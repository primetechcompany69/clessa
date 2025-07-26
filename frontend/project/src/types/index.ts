export interface User {
  email: string;
  role: 'admin' | 'user';
  full_name?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface Product {
  product_id: number;
  sku: string;
  name: string;
  description?: string;
  category: string;
  base_price: number;
  cost_price: number;
  supplier_id?: number;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  variant_id: number;
  product_id: number;
  color?: string;
  model_compatibility?: string;
  current_stock: number;
  low_stock_threshold: number;
}

export interface InventoryItem extends Product {
  variant_id?: number;
  color?: string;
  model_compatibility?: string;
  current_stock?: number;
  low_stock_threshold?: number;
}

export interface SaleItem {
  variant_id: number;
  quantity: number;
  unit_price: number;
  product_name?: string;
}

export interface Transaction {
  transaction_id: number;
  receipt_number: string;
  user_id: number;
  total_amount: number;
  cash_received: number;
  change_given: number;
  customer_phone?: string;
  customer_email?: string;
  created_at: string;
}

export interface SalesReport {
  date: string;
  transactions: number;
  total_sales: number;
  items_sold: number;
}

export interface ApiError {
  error: string;
}

export interface AuditLog {
  log_id: number;
  user_id?: number;
  action: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  user_email?: string;
}

export interface ProductPerformance {
  product_id: number;
  product_name: string;
  total_sold: number;
  total_revenue: number;
  avg_price: number;
}