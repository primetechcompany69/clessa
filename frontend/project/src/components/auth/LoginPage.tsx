import React, { useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      // Redirect will be handled by the auth context
    } catch (error: any) {
      setError(error.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implement forgot password logic here
    alert('Password reset link sent to your email!');
    setShowForgotPassword(false);
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-charcoal via-dark-surface to-charcoal flex items-center justify-center p-4">
        <div className="card w-full max-w-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-text mb-2">Reset Password</h1>
            <p className="text-secondary-text">Enter your email to receive a reset link</p>
          </div>

          <form onSubmit={handleForgotPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="input-field w-full px-4 py-3"
                placeholder="Enter your email"
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-3 px-4 flex items-center justify-center space-x-2"
            >
              <span>Send Reset Link</span>
            </button>

            <button
              type="button"
              onClick={() => setShowForgotPassword(false)}
              className="w-full text-royal-indigo hover:text-indigo-400 font-medium transition-colors"
            >
              Back to Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal via-dark-surface to-charcoal flex items-center justify-center p-4">
      <div className="card w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-royal-indigo/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="text-royal-indigo" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-primary-text mb-2">Welcome Back</h1>
          <p className="text-secondary-text">Sign in to your Clessa Hub account</p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-error text-error px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-field w-full px-4 py-3"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-text mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input-field w-full px-4 py-3 pr-12"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-text hover:text-primary-text"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-royal-indigo bg-dark-surface border-gray-600 rounded focus:ring-royal-indigo focus:ring-2"
              />
              <span className="ml-2 text-sm text-secondary-text">Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-royal-indigo hover:text-indigo-400 font-medium"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-3 px-4 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <LogIn size={20} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-700 text-center">
          <p className="text-sm text-secondary-text">
            Secure login powered by Clessa Hub
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;