import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  helperText,
  options,
  placeholder,
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
        <select
          ref={ref}
          className={`
            input-field w-full appearance-none pr-10 cursor-pointer
            ${getVariantClasses()}
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className="bg-dark-surface text-primary-text"
            >
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-secondary-text">
          <ChevronDown size={16} />
        </div>
      </div>
      
      {(error || helperText) && (
        <p className={`mt-1 text-sm ${error ? 'text-error' : 'text-secondary-text'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;