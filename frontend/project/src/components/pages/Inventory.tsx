import React, { useState, useEffect } from 'react';
import { AlertTriangle, Package, TrendingDown, TrendingUp, Edit, Plus } from 'lucide-react';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';
import { apiClient } from '../../utils/api';
import { InventoryItem } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const Inventory: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'low-stock' | 'out-of-stock'>('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [stockData, setStockData] = useState({
    current_stock: '',
    low_stock_threshold: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const data = await apiClient.getInventory();
      setInventory(data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInventory = inventory.filter(item => {
    if (filter === 'low-stock') {
      return item.current_stock !== undefined && 
             item.low_stock_threshold !== undefined && 
             item.current_stock <= item.low_stock_threshold && 
             item.current_stock > 0;
    }
    if (filter === 'out-of-stock') {
      return item.current_stock === 0;
    }
    return true;
  });

  const getStockStatus = (item: InventoryItem) => {
    if (item.current_stock === 0) {
      return { status: 'out-of-stock', color: 'red', icon: AlertTriangle };
    }
    if (item.current_stock !== undefined && 
        item.low_stock_threshold !== undefined && 
        item.current_stock <= item.low_stock_threshold) {
      return { status: 'low-stock', color: 'yellow', icon: TrendingDown };
    }
    return { status: 'in-stock', color: 'green', icon: TrendingUp };
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setStockData({
      current_stock: (item.current_stock || 0).toString(),
      low_stock_threshold: (item.low_stock_threshold || 0).toString()
    });
    setShowEditModal(true);
  };

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.variant_id) return;

    try {
      await apiClient.updateInventory(editingItem.variant_id, {
        current_stock: parseInt(stockData.current_stock),
        low_stock_threshold: parseInt(stockData.low_stock_threshold)
      });
      
      setShowEditModal(false);
      setEditingItem(null);
      fetchInventory();
    } catch (error) {
      console.error('Error updating inventory:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const lowStockCount = inventory.filter(item => 
    item.current_stock !== undefined && 
    item.low_stock_threshold !== undefined && 
    item.current_stock <= item.low_stock_threshold && 
    item.current_stock > 0
  ).length;

  const outOfStockCount = inventory.filter(item => item.current_stock === 0).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setFilter('low-stock')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'low-stock' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Low Stock ({lowStockCount})
          </button>
          <button
            onClick={() => setFilter('out-of-stock')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'out-of-stock' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Out of Stock ({outOfStockCount})
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">SKU</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Current Stock</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Min. Threshold</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Value</th>
                {user?.role === 'admin' && (
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => {
                const stockInfo = getStockStatus(item);
                const StatusIcon = stockInfo.icon;
                const stockValue = (item.current_stock || 0) * item.base_price;

                return (
                  <tr key={item.product_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-8 h-8 object-cover rounded"
                            />
                          ) : (
                            <Package className="text-gray-400" size={20} />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          {item.color && (
                            <p className="text-sm text-gray-500">Color: {item.color}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-900">{item.sku}</td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`font-medium ${
                        stockInfo.color === 'red' ? 'text-red-600' :
                        stockInfo.color === 'yellow' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {item.current_stock || 0}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{item.low_stock_threshold || 0}</td>
                    <td className="py-4 px-4">
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-sm ${
                        stockInfo.color === 'red' ? 'bg-red-100 text-red-700' :
                        stockInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        <StatusIcon size={14} />
                        <span className="capitalize">{stockInfo.status.replace('-', ' ')}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium text-gray-900">
                      ${stockValue.toFixed(2)}
                    </td>
                    {user?.role === 'admin' && (
                      <td className="py-4 px-4">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredInventory.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'No inventory items available.' 
                : `No items matching the ${filter.replace('-', ' ')} filter.`}
            </p>
          </div>
        )}
      </Card>

      {/* Edit Stock Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Update Stock - {editingItem.name}</h2>
            
            <form onSubmit={handleUpdateStock} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Stock
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={stockData.current_stock}
                  onChange={(e) => setStockData({ ...stockData, current_stock: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={stockData.low_stock_threshold}
                  onChange={(e) => setStockData({ ...stockData, low_stock_threshold: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Update Stock
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingItem(null);
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;