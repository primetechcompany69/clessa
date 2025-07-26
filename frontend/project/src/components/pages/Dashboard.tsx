import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Package, ShoppingCart, DollarSign, AlertTriangle } from 'lucide-react';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';
import { apiClient } from '../../utils/api';
import { SalesReport, InventoryItem } from '../../types';

const Dashboard: React.FC = () => {
  const [salesData, setSalesData] = useState<SalesReport[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [salesResponse, inventoryResponse] = await Promise.all([
          apiClient.getSalesReport(),
          apiClient.getInventory()
        ]);
        
        setSalesData(salesResponse);
        setInventory(inventoryResponse);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const totalSales = salesData.reduce((sum, day) => sum + day.total_sales, 0);
  const totalTransactions = salesData.reduce((sum, day) => sum + day.transactions, 0);
  const totalItemsSold = salesData.reduce((sum, day) => sum + day.items_sold, 0);
  const lowStockItems = inventory.filter(item => 
    item.current_stock !== undefined && 
    item.low_stock_threshold !== undefined && 
    item.current_stock <= item.low_stock_threshold
  );

  const stats = [
    {
      title: 'Total Sales',
      value: `$${totalSales.toLocaleString()}`,
      icon: DollarSign,
      change: '+12%',
      positive: true,
    },
    {
      title: 'Transactions',
      value: totalTransactions.toLocaleString(),
      icon: ShoppingCart,
      change: '+8%',
      positive: true,
    },
    {
      title: 'Items Sold',
      value: totalItemsSold.toLocaleString(),
      icon: Package,
      change: '+15%',
      positive: true,
    },
    {
      title: 'Low Stock Alerts',
      value: lowStockItems.length.toString(),
      icon: AlertTriangle,
      change: lowStockItems.length > 0 ? 'Action needed' : 'All good',
      positive: lowStockItems.length === 0,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Welcome back! Here's what's happening with your business today.
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className={`text-sm mt-1 ${
                    stat.positive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${
                  stat.positive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  <Icon size={24} />
                </div>
              </div>
              <div className={`absolute bottom-0 left-0 h-1 w-full ${
                stat.positive ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Sales Trend" subtitle="Daily sales over the past week">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData.slice(-7)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="total_sales" 
                stroke="#2563eb" 
                strokeWidth={3}
                dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Transaction Volume" subtitle="Number of transactions per day">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData.slice(-7)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="transactions" fill="#1e40af" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <Card title="Low Stock Alerts" subtitle="Items that need restocking">
          <div className="space-y-3">
            {lowStockItems.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="text-yellow-600" size={20} />
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-red-600">{item.current_stock} left</p>
                  <p className="text-sm text-gray-600">Min: {item.low_stock_threshold}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;