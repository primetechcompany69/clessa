import axios, { AxiosInstance, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { AuthResponse, Product, InventoryItem, SalesReport, Transaction, ApiError } from '../types';

const API_BASE_URL = 'http://localhost:5000'; // Backend running without SSL

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use((config) => {
      const token = Cookies.get('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          const refreshToken = Cookies.get('refresh_token');
          if (refreshToken) {
            try {
              const response = await this.refreshToken();
              Cookies.set('access_token', response.access_token, { expires: 1 });
              
              // Retry the original request
              error.config.headers.Authorization = `Bearer ${response.access_token}`;
              return this.client.request(error.config);
            } catch (refreshError) {
              this.logout();
              window.location.href = '/login';
            }
          } else {
            this.logout();
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async login(email: string, password: string): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.client.post('/api/auth/login', {
      email,
      password,
    });
    
    Cookies.set('access_token', response.data.access_token, { expires: 1 });
    Cookies.set('refresh_token', response.data.refresh_token, { expires: 30 });
    
    return response.data;
  }

  async refreshToken(): Promise<{ access_token: string }> {
    const refreshToken = Cookies.get('refresh_token');
    const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {}, {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });
    return response.data;
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const response = await this.client.post('/api/auth/request-password-reset', { email });
    return response.data;
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response = await this.client.post('/api/auth/reset-password', {
      token,
      new_password: newPassword,
    });
    return response.data;
  }

  logout(): void {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
  }

  // Products
  async getProducts(search?: string): Promise<Product[]> {
    const params = search ? { search } : {};
    const response: AxiosResponse<Product[]> = await this.client.get('/api/products', { params });
    return response.data;
  }

  async getProduct(productId: number): Promise<Product> {
    const response: AxiosResponse<Product> = await this.client.get(`/api/products/${productId}`);
    return response.data;
  }

  async createProduct(productData: Partial<Product>): Promise<{ product_id: number }> {
    const response = await this.client.post('/api/products', productData);
    return response.data;
  }

  async updateProduct(productId: number, productData: Partial<Product>): Promise<void> {
    await this.client.put(`/api/products/${productId}`, productData);
  }

  async deleteProduct(productId: number): Promise<void> {
    await this.client.delete(`/api/products/${productId}`);
  }
  // Inventory
  async getInventory(): Promise<InventoryItem[]> {
    const response: AxiosResponse<InventoryItem[]> = await this.client.get('/api/inventory');
    return response.data;
  }

  async updateInventory(variantId: number, stockData: { current_stock: number; low_stock_threshold: number }): Promise<void> {
    await this.client.put(`/api/inventory/${variantId}`, stockData);
  }

  async createProductVariant(variantData: {
    product_id: number;
    color?: string;
    model_compatibility?: string;
    current_stock: number;
    low_stock_threshold: number;
  }): Promise<{ variant_id: number }> {
    const response = await this.client.post('/api/inventory/variants', variantData);
    return response.data;
  }
  // Sales
  async createSale(saleData: {
    items: Array<{ variant_id: number; quantity: number; unit_price: number }>;
    total_amount: number;
    cash_received: number;
    customer_phone?: string;
    customer_email?: string;
  }): Promise<{ transaction_id: number }> {
    const response = await this.client.post('/api/sales', saleData);
    return response.data;
  }

  async getTransactions(startDate?: string, endDate?: string): Promise<Transaction[]> {
    const params: any = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const response: AxiosResponse<Transaction[]> = await this.client.get('/api/transactions', { params });
    return response.data;
  }

  async getTransaction(transactionId: number): Promise<Transaction> {
    const response: AxiosResponse<Transaction> = await this.client.get(`/api/transactions/${transactionId}`);
    return response.data;
  }
  // Reports
  async getSalesReport(startDate?: string, endDate?: string): Promise<SalesReport[]> {
    const params: any = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const response: AxiosResponse<SalesReport[]> = await this.client.get('/api/reports/sales', { params });
    return response.data;
  }

  async getInventoryReport(): Promise<any[]> {
    const response = await this.client.get('/api/reports/inventory');
    return response.data;
  }

  async getProductPerformanceReport(startDate?: string, endDate?: string): Promise<any[]> {
    const params: any = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const response = await this.client.get('/api/reports/product-performance', { params });
    return response.data;
  }

  // User Management (Admin only)
  async getUsers(): Promise<User[]> {
    const response: AxiosResponse<User[]> = await this.client.get('/api/admin/users');
    return response.data;
  }

  async createUser(userData: {
    email: string;
    password: string;
    role: 'admin' | 'user';
    full_name?: string;
  }): Promise<{ user_id: number }> {
    const response = await this.client.post('/api/admin/users', userData);
    return response.data;
  }

  async updateUser(userId: number, userData: Partial<User>): Promise<void> {
    await this.client.put(`/api/admin/users/${userId}`, userData);
  }

  async deleteUser(userId: number): Promise<void> {
    await this.client.delete(`/api/admin/users/${userId}`);
  }

  // Audit Logs (Admin only)
  async getAuditLogs(startDate?: string, endDate?: string): Promise<any[]> {
    const params: any = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const response = await this.client.get('/api/admin/audit-logs', { params });
    return response.data;
  }
}

export const apiClient = new ApiClient();