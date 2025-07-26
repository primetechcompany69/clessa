import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Database, Palette } from 'lucide-react';
import Card from '../common/Card';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      desktop: false,
      lowStock: true,
      dailyReports: true
    },
    security: {
      twoFactor: false,
      sessionTimeout: '60'
    },
    system: {
      theme: 'light',
      language: 'en',
      currency: 'USD'
    }
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: value
      }
    });
  };

  const handleSecurityChange = (key: string, value: string | boolean) => {
    setSettings({
      ...settings,
      security: {
        ...settings.security,
        [key]: value
      }
    });
  };

  const handleSystemChange = (key: string, value: string) => {
    setSettings({
      ...settings,
      system: {
        ...settings.system,
        [key]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
          Save All Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <Card>
          <div className="flex items-center space-x-3 mb-6">
            <Bell className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
          </div>

          <div className="space-y-4">
            {[
              { key: 'email', label: 'Email Notifications', description: 'Receive notifications via email' },
              { key: 'desktop', label: 'Desktop Notifications', description: 'Show browser notifications' },
              { key: 'lowStock', label: 'Low Stock Alerts', description: 'Alert when inventory is low' },
              { key: 'dailyReports', label: 'Daily Reports', description: 'Receive daily sales reports' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications[item.key as keyof typeof settings.notifications]}
                    onChange={(e) => handleNotificationChange(item.key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </Card>

        {/* Security */}
        <Card>
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="text-green-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">Security</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600">Add an extra layer of security</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.security.twoFactor}
                  onChange={(e) => handleSecurityChange('twoFactor', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Timeout (minutes)
              </label>
              <select
                value={settings.security.sessionTimeout}
                onChange={(e) => handleSecurityChange('sessionTimeout', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
                <option value="240">4 hours</option>
              </select>
            </div>
          </div>
        </Card>

        {/* System Preferences */}
        <Card>
          <div className="flex items-center space-x-3 mb-6">
            <Palette className="text-purple-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">System Preferences</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme
              </label>
              <select
                value={settings.system.theme}
                onChange={(e) => handleSystemChange('theme', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={settings.system.language}
                onChange={(e) => handleSystemChange('language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={settings.system.currency}
                onChange={(e) => handleSystemChange('currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="KES">KES (KSh)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Database Settings */}
        <Card>
          <div className="flex items-center space-x-3 mb-6">
            <Database className="text-red-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">Database</h2>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Database Status</p>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-600">Connected</span>
              </div>
            </div>

            <div className="space-y-2">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                Backup Database
              </button>
              <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg transition-colors">
                Test Connection
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;