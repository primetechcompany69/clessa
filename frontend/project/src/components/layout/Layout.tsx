import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Dashboard from '../pages/Dashboard';
import Products from '../pages/Products';
import Inventory from '../pages/Inventory';
import Sales from '../pages/Sales';
import Reports from '../pages/Reports';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import UserManagement from '../pages/UserManagement';
import AuditLogs from '../pages/AuditLogs';
import TransactionHistory from '../pages/TransactionHistory';

const Layout: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <Products />;
      case 'inventory':
        return <Inventory />;
      case 'sales':
        return <Sales />;
      case 'reports':
        return <Reports />;
      case 'transactions':
        return <TransactionHistory />;
      case 'users':
        return <UserManagement />;
      case 'audit':
        return <AuditLogs />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-charcoal">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="flex-1 overflow-auto">
        <main className="p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default Layout;