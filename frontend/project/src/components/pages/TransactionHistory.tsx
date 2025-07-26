import React, { useState, useEffect } from 'react';
import { Receipt, Calendar, DollarSign, User, Search, Eye } from 'lucide-react';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';
import { apiClient } from '../../utils/api';
import { Transaction } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { format, subDays } from 'date-fns';

const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchTransactions();
    }
  }, [user, dateRange]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getTransactions(dateRange.start, dateRange.end);
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction =>
    transaction.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (transaction.customer_email && transaction.customer_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (transaction.customer_phone && transaction.customer_phone.includes(searchTerm))
  );

  const viewTransactionDetails = async (transaction: Transaction) => {
    try {
      const details = await apiClient.getTransaction(transaction.transaction_id);
      setSelectedTransaction(details);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching transaction details:', error);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Receipt className="mx-auto text-red-500 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.total_amount, 0);
  const averageTransaction = filteredTransactions.length > 0 ? totalRevenue / filteredTransactions.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
        <div className="text-sm text-gray-500">
          Complete transaction records and details
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { 
            title: 'Total Transactions', 
            value: filteredTransactions.length.toString(), 
            icon: Receipt, 
            color: 'blue' 
          },
          { 
            title: 'Total Revenue', 
            value: `$${totalRevenue.toLocaleString()}`, 
            icon: DollarSign, 
            color: 'green' 
          },
          { 
            title: 'Average Transaction', 
            value: `$${averageTransaction.toFixed(2)}`, 
            icon: DollarSign, 
            color: 'purple' 
          },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full bg-${stat.color}-100 text-${stat.color}-600`}>
                  <Icon size={24} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by receipt, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-2">
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
          </div>
          
          <div className="flex items-center space-x-2">
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
        </div>
      </Card>

      {/* Transactions Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Receipt #</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Payment</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Change</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.transaction_id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <Receipt className="text-gray-400" size={16} />
                      <span className="font-mono text-sm font-medium text-gray-900">
                        {transaction.receipt_number}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="text-gray-400" size={16} />
                      <span className="text-gray-900">
                        {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <User className="text-gray-400" size={16} />
                      <div>
                        {transaction.customer_email ? (
                          <p className="text-sm text-gray-900">{transaction.customer_email}</p>
                        ) : transaction.customer_phone ? (
                          <p className="text-sm text-gray-900">{transaction.customer_phone}</p>
                        ) : (
                          <p className="text-sm text-gray-500">Walk-in Customer</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-bold text-gray-900">
                      ${transaction.total_amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-gray-900">
                      ${transaction.cash_received.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-gray-900">
                      ${transaction.change_given.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => viewTransactionDetails(transaction)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <Receipt className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
            <p className="text-gray-600">
              {searchTerm 
                ? 'Try adjusting your search criteria.' 
                : 'No transactions recorded for the selected date range.'}
            </p>
          </div>
        )}
      </Card>

      {/* Transaction Details Modal */}
      {showDetailsModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Transaction Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Transaction Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Receipt Number</label>
                  <p className="font-mono text-sm">{selectedTransaction.receipt_number}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <p className="text-sm">{format(new Date(selectedTransaction.created_at), 'MMM dd, yyyy HH:mm:ss')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                  <p className="text-lg font-bold">${selectedTransaction.total_amount.toFixed(2)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cash Received</label>
                  <p className="text-sm">${selectedTransaction.cash_received.toFixed(2)}</p>
                </div>
              </div>

              {/* Customer Info */}
              {(selectedTransaction.customer_email || selectedTransaction.customer_phone) && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Customer Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {selectedTransaction.customer_email && (
                      <p className="text-sm"><strong>Email:</strong> {selectedTransaction.customer_email}</p>
                    )}
                    {selectedTransaction.customer_phone && (
                      <p className="text-sm"><strong>Phone:</strong> {selectedTransaction.customer_phone}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;