import React, { useState } from 'react';
import { 
  Shield, 
  Bell, 
  User, 
  Lock, 
  Monitor, 
  Wifi,
  Database,
  AlertTriangle,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Check,
  X
} from 'lucide-react';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('security');
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    // Security Settings
    realTimeScanning: true,
    behaviorAnalysis: true,
    automaticUpdates: true,
    quarantineThreats: true,
    
    // Notification Settings
    emailAlerts: true,
    pushNotifications: true,
    threatAlerts: true,
    systemAlerts: false,
    
    // System Settings
    scanFrequency: 'daily',
    logRetention: '90',
    maxCpuUsage: '50',
    
    // User Settings
    theme: 'dark',
    language: 'en',
    timezone: 'UTC'
  });

  const tabs = [
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'system', label: 'System', icon: Monitor },
    { id: 'user', label: 'User Profile', icon: User },
    { id: 'advanced', label: 'Advanced', icon: Lock }
  ];

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="cyber-chart-title mb-4">Protection Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 cyber-card">
            <div>
              <h4 className="font-medium text-cyber-text-primary">Real-time Scanning</h4>
              <p className="text-sm text-cyber-text-secondary">Monitor files and processes in real-time</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.realTimeScanning}
                onChange={(e) => handleSettingChange('realTimeScanning', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-cyber-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyber-cyan"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 cyber-card">
            <div>
              <h4 className="font-medium text-cyber-text-primary">Behavior Analysis</h4>
              <p className="text-sm text-cyber-text-secondary">Detect threats based on suspicious behavior</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.behaviorAnalysis}
                onChange={(e) => handleSettingChange('behaviorAnalysis', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-cyber-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyber-cyan"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 cyber-card">
            <div>
              <h4 className="font-medium text-cyber-text-primary">Automatic Updates</h4>
              <p className="text-sm text-cyber-text-secondary">Keep threat definitions up to date</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.automaticUpdates}
                onChange={(e) => handleSettingChange('automaticUpdates', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-cyber-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyber-cyan"></div>
            </label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="cyber-chart-title mb-4">Threat Response</h3>
        <div className="cyber-card p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-cyber-text-secondary mb-2">
                Scan Frequency
              </label>
              <select
                value={settings.scanFrequency}
                onChange={(e) => handleSettingChange('scanFrequency', e.target.value)}
                className="cyber-input w-full"
              >
                <option value="hourly">Every Hour</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="manual">Manual Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-cyber-text-secondary mb-2">
                Maximum CPU Usage (%)
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={settings.maxCpuUsage}
                onChange={(e) => handleSettingChange('maxCpuUsage', e.target.value)}
                className="w-full h-2 bg-cyber-surface rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="text-sm text-cyber-text-primary mt-1">{settings.maxCpuUsage}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="cyber-chart-title mb-4">Alert Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 cyber-card">
            <div>
              <h4 className="font-medium text-cyber-text-primary">Email Alerts</h4>
              <p className="text-sm text-cyber-text-secondary">Receive security alerts via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailAlerts}
                onChange={(e) => handleSettingChange('emailAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-cyber-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyber-cyan"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 cyber-card">
            <div>
              <h4 className="font-medium text-cyber-text-primary">Push Notifications</h4>
              <p className="text-sm text-cyber-text-secondary">Real-time browser notifications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-cyber-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyber-cyan"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 cyber-card">
            <div>
              <h4 className="font-medium text-cyber-text-primary">Critical Threat Alerts</h4>
              <p className="text-sm text-cyber-text-secondary">Immediate alerts for high-risk threats</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.threatAlerts}
                onChange={(e) => handleSettingChange('threatAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-cyber-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyber-cyan"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="cyber-chart-title mb-4">System Configuration</h3>
        <div className="cyber-card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-cyber-text-secondary mb-2">
              Log Retention (days)
            </label>
            <input
              type="number"
              value={settings.logRetention}
              onChange={(e) => handleSettingChange('logRetention', e.target.value)}
              className="cyber-input w-full"
              min="30"
              max="365"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-cyber-text-secondary mb-2">
              Database Backup Frequency
            </label>
            <select className="cyber-input w-full">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="cyber-chart-title mb-4">Performance Monitoring</h3>
        <div className="cyber-grid cyber-grid-3">
          <div className="cyber-metric-card">
            <Database className="text-cyber-cyan mb-2" size={24} />
            <div className="cyber-metric-value text-cyber-cyan">2.4GB</div>
            <div className="cyber-metric-label">Database Size</div>
          </div>
          <div className="cyber-metric-card">
            <Monitor className="text-cyber-success mb-2" size={24} />
            <div className="cyber-metric-value text-cyber-success">12%</div>
            <div className="cyber-metric-label">CPU Usage</div>
          </div>
          <div className="cyber-metric-card">
            <Wifi className="text-cyber-warning mb-2" size={24} />
            <div className="cyber-metric-value text-cyber-warning">156MB</div>
            <div className="cyber-metric-label">Memory Usage</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="cyber-chart-title mb-4">Profile Information</h3>
        <div className="cyber-card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-cyber-text-secondary mb-2">
              Full Name
            </label>
            <input
              type="text"
              defaultValue="System Administrator"
              className="cyber-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-cyber-text-secondary mb-2">
              Email Address
            </label>
            <input
              type="email"
              defaultValue="admin@vertexguard.com"
              className="cyber-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-cyber-text-secondary mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter current password"
                className="cyber-input w-full pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyber-text-secondary hover:text-cyber-text-primary"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="cyber-chart-title mb-4">Preferences</h3>
        <div className="cyber-card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-cyber-text-secondary mb-2">
              Theme
            </label>
            <select
              value={settings.theme}
              onChange={(e) => handleSettingChange('theme', e.target.value)}
              className="cyber-input w-full"
            >
              <option value="dark">Dark (Recommended)</option>
              <option value="light">Light</option>
              <option value="auto">Auto</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-cyber-text-secondary mb-2">
              Language
            </label>
            <select
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
              className="cyber-input w-full"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'security':
        return renderSecuritySettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'system':
        return renderSystemSettings();
      case 'user':
        return renderUserSettings();
      default:
        return renderSecuritySettings();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cyber-text-primary font-heading">
            System Settings
          </h1>
          <p className="text-cyber-text-secondary mt-1">
            Configure security preferences and system behavior
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-cyber-outline">
            <RefreshCw size={16} className="mr-2" />
            Reset
          </button>
          <button className="btn-cyber">
            <Save size={16} className="mr-2" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="cyber-card">
        <div className="border-b border-cyber-border">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-cyber-cyan text-cyber-cyan'
                      : 'border-transparent text-cyber-text-secondary hover:text-cyber-text-primary hover:border-cyber-border'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* System Status */}
      <div className="cyber-card p-6">
        <h3 className="cyber-chart-title mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-cyber-success rounded-full animate-pulse"></div>
            <span className="text-cyber-text-primary">Real-time Protection: Active</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-cyber-success rounded-full animate-pulse"></div>
            <span className="text-cyber-text-primary">Threat Database: Updated</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-cyber-warning rounded-full"></div>
            <span className="text-cyber-text-primary">System Scan: Scheduled</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-cyber-success rounded-full animate-pulse"></div>
            <span className="text-cyber-text-primary">Network Monitoring: Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
