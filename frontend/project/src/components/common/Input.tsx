import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  variant = 'default',
  className = '',
  ...props
}, ref) => {
  const getVariantClasses = () => {
    if (error) {
      return 'border-error focus:ring-error';
    }
    
    switch (variant) {
      case 'success':
        return 'border-success focus:ring-success';
      case 'warning':
        return 'border-warning focus:ring-warning';
      case 'error':
        return 'border-error focus:ring-error';
      default:
        return 'border-gray-600 focus:ring-royal-indigo';
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-primary-text mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-text">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          className={`
            input-field w-full
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${getVariantClasses()}
            ${className}
          `}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-text">
            {rightIcon}
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <p className={`mt-1 text-sm ${error ? 'text-error' : 'text-secondary-text'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;