import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard } from 'lucide-react';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';
import { apiClient } from '../../utils/api';
import { InventoryItem, SaleItem } from '../../types';

const Sales: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    phone: '',
    email: ''
  });
  const [cashReceived, setCashReceived] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const data = await apiClient.getInventory();
      setInventory(data.filter(item => (item.current_stock || 0) > 0));
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = (item: InventoryItem) => {
    const existingItem = cart.find(cartItem => cartItem.variant_id === item.variant_id);
    
    if (existingItem) {
      if (existingItem.quantity < (item.current_stock || 0)) {
        setCart(cart.map(cartItem =>
          cartItem.variant_id === item.variant_id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        ));
      }
    } else {
      setCart([...cart, {
        variant_id: item.variant_id!,
        quantity: 1,
        unit_price: item.base_price,
        product_name: item.name
      }]);
    }
  };

  const updateQuantity = (variantId: number, change: number) => {
    const item = inventory.find(item => item.variant_id === variantId);
    const maxStock = item?.current_stock || 0;

    setCart(cart.map(cartItem => {
      if (cartItem.variant_id === variantId) {
        const newQuantity = Math.max(0, Math.min(maxStock, cartItem.quantity + change));
        return { ...cartItem, quantity: newQuantity };
      }
      return cartItem;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (variantId: number) => {
    setCart(cart.filter(item => item.variant_id !== variantId));
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.quantity * item.unit_price), 0);
  };

  const getChange = () => {
    const cash = parseFloat(cashReceived) || 0;
    const total = getTotalAmount();
    return Math.max(0, cash - total);
  };

  const processSale = async () => {
    if (!cart.length || parseFloat(cashReceived) < getTotalAmount()) return;

    setIsProcessing(true);
    try {
      await apiClient.createSale({
        items: cart,
        total_amount: getTotalAmount(),
        cash_received: parseFloat(cashReceived),
        customer_phone: customerInfo.phone || undefined,
        customer_email: customerInfo.email || undefined
      });

      // Reset form
      setCart([]);
      setCashReceived('');
      setCustomerInfo({ phone: '', email: '' });
      setShowCheckout(false);
      
      // Refresh inventory
      fetchInventory();
      
      alert('Sale processed successfully!');
    } catch (error) {
      console.error('Error processing sale:', error);
      alert('Error processing sale. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Point of Sale</h1>
        <div className="flex items-center space-x-4">
          <span className="text-lg font-medium text-gray-600">
            Items in Cart: {cart.reduce((total, item) => total + item.quantity, 0)}
          </span>
          <span className="text-2xl font-bold text-blue-600">
            Total: ${getTotalAmount().toFixed(2)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Selection */}
        <div className="lg:col-span-2">
          <Card title="Select Products" subtitle="Choose items to add to the cart">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {inventory.map((item) => (
                <div
                  key={item.variant_id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => addToCart(item)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <ShoppingCart className="text-gray-400" size={20} />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm">{item.name}</h3>
                      <p className="text-xs text-gray-600">{item.sku}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-bold text-blue-600">${item.base_price}</span>
                        <span className="text-xs text-gray-500">Stock: {item.current_stock}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Shopping Cart */}
        <div className="space-y-6">
          <Card title="Shopping Cart">
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600">No items in cart</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.variant_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{item.product_name}</p>
                      <p className="text-xs text-gray-600">${item.unit_price} each</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.variant_id, -1)}
                        className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.variant_id, 1)}
                        className="p-1 text-gray-600 hover:text-green-600 transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.variant_id)}
                        className="p-1 text-red-600 hover:text-red-700 transition-colors ml-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                
                <div className="border-t pt-3 mt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span>${getTotalAmount().toFixed(2)}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <CreditCard size={20} />
                  <span>Proceed to Checkout</span>
                </button>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Checkout</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Email (Optional)
                </label>
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cash Received *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span>Subtotal:</span>
                  <span>${getTotalAmount().toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Cash Received:</span>
                  <span>${(parseFloat(cashReceived) || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Change:</span>
                  <span className={getChange() >= 0 ? 'text-green-600' : 'text-red-600'}>
                    ${getChange().toFixed(2)}
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={processSale}
                  disabled={isProcessing || parseFloat(cashReceived) < getTotalAmount()}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  {isProcessing ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <CreditCard size={16} />
                      <span>Complete Sale</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;