import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
}

const Card: React.FC<CardProps> = ({ children, className = '', title, subtitle, variant = 'default' }) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'premium':
        return 'border-premium-gold/30 bg-gradient-to-br from-dark-surface to-amber-900/10';
      case 'success':
        return 'border-success/30 bg-gradient-to-br from-dark-surface to-green-900/10';
      case 'warning':
        return 'border-warning/30 bg-gradient-to-br from-dark-surface to-amber-900/10';
      case 'error':
        return 'border-error/30 bg-gradient-to-br from-dark-surface to-red-900/10';
      default:
        return 'border-gray-700';
    }
  };

  return (
    <div className={`card ${getVariantClasses()} ${className}`}>
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-gray-700">
          {title && <h3 className="text-lg font-semibold text-primary-text">{title}</h3>}
          {subtitle && <p className="text-sm text-secondary-text mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;