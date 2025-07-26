import React, { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  helperText,
  variant = 'default',
  resize = 'vertical',
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

  const getResizeClasses = () => {
    switch (resize) {
      case 'none':
        return 'resize-none';
      case 'horizontal':
        return 'resize-x';
      case 'both':
        return 'resize';
      default:
        return 'resize-y';
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-primary-text mb-2">
          {label}
        </label>
      )}
      
      <textarea
        ref={ref}
        className={`
          input-field w-full min-h-[100px]
          ${getVariantClasses()}
          ${getResizeClasses()}
          ${className}
        `}
        {...props}
      />
      
      {(error || helperText) && (
        <p className={`mt-1 text-sm ${error ? 'text-error' : 'text-secondary-text'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;