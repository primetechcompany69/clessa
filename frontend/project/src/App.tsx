import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/auth/LoginPage';
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-charcoal">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return isAuthenticated ? <Layout /> : <LoginPage />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;