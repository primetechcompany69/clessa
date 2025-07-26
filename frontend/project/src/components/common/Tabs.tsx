import React, { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
  badge?: string | number;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  onChange,
  variant = 'default',
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const getTabClasses = (tab: Tab, isActive: boolean) => {
    const baseClasses = 'px-4 py-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-royal-indigo focus:ring-offset-2 focus:ring-offset-charcoal';
    
    if (tab.disabled) {
      return `${baseClasses} opacity-50 cursor-not-allowed text-secondary-text`;
    }

    switch (variant) {
      case 'pills':
        return `${baseClasses} rounded-lg ${
          isActive
            ? 'bg-royal-indigo text-white shadow-dark'
            : 'text-secondary-text hover:text-primary-text hover:bg-surface-hover'
        }`;
      case 'underline':
        return `${baseClasses} border-b-2 ${
          isActive
            ? 'border-royal-indigo text-royal-indigo'
            : 'border-transparent text-secondary-text hover:text-primary-text hover:border-gray-600'
        }`;
      default:
        return `${baseClasses} rounded-t-lg border-t border-l border-r ${
          isActive
            ? 'bg-dark-surface border-gray-600 text-primary-text'
            : 'bg-charcoal border-gray-700 text-secondary-text hover:text-primary-text hover:bg-surface-hover'
        }`;
    }
  };

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={className}>
      {/* Tab Headers */}
      <div className={`flex space-x-1 ${variant === 'underline' ? 'border-b border-gray-700' : ''}`}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && handleTabChange(tab.id)}
              className={getTabClasses(tab, isActive)}
              disabled={tab.disabled}
            >
              <div className="flex items-center space-x-2">
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="bg-royal-indigo text-white text-xs px-2 py-1 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className={`mt-4 ${variant === 'default' ? 'bg-dark-surface border border-gray-700 border-t-0 rounded-b-lg p-6' : ''}`}>
        {activeTabContent}
      </div>
    </div>
  );
};

export default Tabs;