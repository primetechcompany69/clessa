import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'premium';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default', 
  size = 'md', 
  className = '' 
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-royal-indigo/20 text-royal-indigo border-royal-indigo/30';
      case 'success':
        return 'bg-success/20 text-success border-success/30';
      case 'warning':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'error':
        return 'bg-error/20 text-error border-error/30';
      case 'premium':
        return 'bg-gradient-accent text-white border-premium-gold/30 shadow-dark';
      default:
        return 'bg-gray-700/50 text-secondary-text border-gray-600';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-2 text-base';
      default:
        return 'px-3 py-1 text-sm';
    }
  };

  return (
    <span className={`
      inline-flex items-center font-medium rounded-full border
      ${getVariantClasses()} 
      ${getSizeClasses()} 
      ${className}
    `}>
      {children}
    </span>
  );
};

export default Badge;