import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Calendar, TrendingUp, DollarSign, Download } from 'lucide-react';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';
import { apiClient } from '../../utils/api';
import { SalesReport } from '../../types';
import { format, subDays } from 'date-fns';

const Reports: React.FC = () => {
  const [salesData, setSalesData] = useState<SalesReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    fetchSalesData();
  }, [dateRange]);

  const fetchSalesData = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getSalesReport(dateRange.start, dateRange.end);
      setSalesData(data);
    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalSales = salesData.reduce((sum, day) => sum + day.total_sales, 0);
  const totalTransactions = salesData.reduce((sum, day) => sum + day.transactions, 0);
  const totalItems = salesData.reduce((sum, day) => sum + day.items_sold, 0);
  const avgTransactionValue = totalTransactions > 0 ? totalSales / totalTransactions : 0;

  const pieData = salesData.slice(0, 7).map(day => ({
    name: format(new Date(day.date), 'MMM dd'),
    value: day.total_sales
  }));

  const COLORS = ['#2563eb', '#1e40af', '#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Sales Reports</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
          <Download size={20} />
          <span>Export Report</span>
        </button>
      </div>

      {/* Date Range Selector */}
      <Card>
        <div className="flex items-center space-x-4">
          <Calendar className="text-gray-400" size={20} />
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">From:</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">To:</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Sales', value: `$${totalSales.toLocaleString()}`, icon: DollarSign, color: 'blue' },
          { title: 'Transactions', value: totalTransactions.toLocaleString(), icon: TrendingUp, color: 'green' },
          { title: 'Items Sold', value: totalItems.toLocaleString(), icon: TrendingUp, color: 'purple' },
          { title: 'Avg. Transaction', value: `$${avgTransactionValue.toFixed(2)}`, icon: DollarSign, color: 'orange' },
        ].map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                </div>
                <div className={`p-3 rounded-full bg-${metric.color}-100 text-${metric.color}-600`}>
                  <Icon size={24} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Daily Sales Trend" subtitle="Sales performance over time">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => format(new Date(date), 'MMM dd')}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy')}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Sales']}
              />
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
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => format(new Date(date), 'MMM dd')}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy')}
                formatter={(value: number) => [value, 'Transactions']}
              />
              <Bar dataKey="transactions" fill="#1e40af" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Sales Distribution" subtitle="Sales breakdown by day">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Sales']} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Items Sold Trend" subtitle="Daily item sales volume">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => format(new Date(date), 'MMM dd')}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy')}
                formatter={(value: number) => [value, 'Items Sold']}
              />
              <Bar dataKey="items_sold" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Data Table */}
      <Card title="Detailed Sales Data" subtitle="Complete breakdown by day">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Sales</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Transactions</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Items Sold</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Avg. Transaction</th>
              </tr>
            </thead>
            <tbody>
              {salesData.map((day, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {format(new Date(day.date), 'MMM dd, yyyy')}
                  </td>
                  <td className="py-3 px-4 text-gray-900">${day.total_sales.toLocaleString()}</td>
                  <td className="py-3 px-4 text-gray-900">{day.transactions}</td>
                  <td className="py-3 px-4 text-gray-900">{day.items_sold}</td>
                  <td className="py-3 px-4 text-gray-900">
                    ${day.transactions > 0 ? (day.total_sales / day.transactions).toFixed(2) : '0.00'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Reports;