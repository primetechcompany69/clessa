/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary Brand Color
        'royal-indigo': '#6366F1',
        
        // Accent Color
        'premium-gold': '#F59E0B',
        
        // Background & Surfaces
        'charcoal': '#111827',
        'dark-surface': '#374151',
        'surface-hover': '#4B5563',
        
        // Text Colors
        'primary-text': '#FAFAFA',
        'secondary-text': '#9CA3AF',
        
        // Semantic Colors
        'success': '#22C55E',
        'warning': '#F59E0B',
        'error': '#EF4444',
        
        // Utility Colors
        'slate-blue': '#6D83F2',
        'steel-blue': '#4682B4',
        'soft-teal': '#5EEAD4',
        
        // Dark theme overrides
        gray: {
          50: '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
          600: '#52525B',
          700: '#3F3F46',
          800: '#27272A',
          900: '#18181B',
          950: '#09090B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'dark': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
        'dark-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
      }
    },
  },
  plugins: [],
};
