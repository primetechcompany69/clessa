import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  Receipt,
  Users,
  Shield
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'inventory', label: 'Inventory', icon: ShoppingCart },
    { id: 'sales', label: 'Point of Sale', icon: ShoppingCart },
    ...(user?.role === 'admin' ? [
      { id: 'reports', label: 'Reports', icon: BarChart3 },
      { id: 'transactions', label: 'Transactions', icon: Receipt },
      { id: 'users', label: 'User Management', icon: Users },
      { id: 'audit', label: 'Audit Logs', icon: Shield }
    ] : []),
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className={`relative h-screen bg-gradient-to-b from-charcoal via-dark-surface to-charcoal text-primary-text transition-all duration-300 shadow-dark-xl ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className={`font-bold text-xl transition-opacity duration-300 ${
          isCollapsed ? 'opacity-0' : 'opacity-100'
        } text-gradient`}>
          Clessa Hub
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-lg hover:bg-surface-hover transition-colors text-secondary-text hover:text-primary-text"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-6 flex-1">
        <ul className="space-y-2 px-3">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onPageChange(item.id)}
                  className={`sidebar-item w-full ${
                    isActive
                      ? 'active'
                      : ''
                  }`}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  <span className={`ml-3 transition-opacity duration-300 ${
                    isCollapsed ? 'opacity-0' : 'opacity-100'
                  }`}>
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-gray-700 p-3 space-y-2">
        <button
          onClick={() => onPageChange('settings')}
          className="sidebar-item w-full"
        >
          <Settings size={20} className="flex-shrink-0" />
          <span className={`ml-3 transition-opacity duration-300 ${
            isCollapsed ? 'opacity-0' : 'opacity-100'
          }`}>
            Settings
          </span>
        </button>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200 text-error hover:text-red-400 hover:bg-red-900/20"
        >
          <LogOut size={20} className="flex-shrink-0" />
          <span className={`ml-3 transition-opacity duration-300 ${
            isCollapsed ? 'opacity-0' : 'opacity-100'
          }`}>
            Sign Out
          </span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;