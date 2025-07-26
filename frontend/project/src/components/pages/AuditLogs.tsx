import React, { useState, useEffect } from 'react';
import { Shield, Calendar, Globe, Monitor, Filter } from 'lucide-react';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';
import { apiClient } from '../../utils/api';
import { AuditLog } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { format, subDays } from 'date-fns';

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });
  const [actionFilter, setActionFilter] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAuditLogs();
    }
  }, [user, dateRange]);

  const fetchAuditLogs = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getAuditLogs(dateRange.start, dateRange.end);
      setLogs(data);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (actionFilter === 'all') return true;
    return log.action.toLowerCase().includes(actionFilter.toLowerCase());
  });

  const getActionColor = (action: string) => {
    if (action.includes('login')) return 'text-green-600 bg-green-100';
    if (action.includes('failed')) return 'text-red-600 bg-red-100';
    if (action.includes('delete')) return 'text-red-600 bg-red-100';
    if (action.includes('create')) return 'text-blue-600 bg-blue-100';
    if (action.includes('update')) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="mx-auto text-red-500 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
        <div className="text-sm text-gray-500">
          Security and activity monitoring
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="text-gray-400" size={20} />
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">From:</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">To:</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="text-gray-400" size={20} />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Actions</option>
              <option value="login">Login Events</option>
              <option value="failed">Failed Attempts</option>
              <option value="create">Create Actions</option>
              <option value="update">Update Actions</option>
              <option value="delete">Delete Actions</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Logs Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Timestamp</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Action</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">IP Address</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">User Agent</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.log_id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="text-gray-400" size={16} />
                      <span className="text-gray-900">
                        {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss')}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <Shield className="text-gray-400" size={16} />
                      <span className="text-gray-900">
                        {log.user_email || `User ID: ${log.user_id || 'N/A'}`}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${getActionColor(log.action)}`}>
                      {log.action.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <Globe className="text-gray-400" size={16} />
                      <span className="text-gray-900 font-mono text-sm">{log.ip_address}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <Monitor className="text-gray-400" size={16} />
                      <span className="text-gray-600 text-sm truncate max-w-xs" title={log.user_agent}>
                        {log.user_agent}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <Shield className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No audit logs found</h3>
            <p className="text-gray-600">
              {actionFilter === 'all' 
                ? 'No activity recorded for the selected date range.' 
                : `No ${actionFilter} activities found for the selected date range.`}
            </p>
          </div>
        )}
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { 
            title: 'Total Events', 
            value: filteredLogs.length.toString(), 
            icon: Shield, 
            color: 'blue' 
          },
          { 
            title: 'Login Events', 
            value: filteredLogs.filter(log => log.action.includes('login')).length.toString(), 
            icon: Calendar, 
            color: 'green' 
          },
          { 
            title: 'Failed Attempts', 
            value: filteredLogs.filter(log => log.action.includes('failed')).length.toString(), 
            icon: Globe, 
            color: 'red' 
          },
          { 
            title: 'Unique IPs', 
            value: new Set(filteredLogs.map(log => log.ip_address)).size.toString(), 
            icon: Monitor, 
            color: 'purple' 
          },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full bg-${stat.color}-100 text-${stat.color}-600`}>
                  <Icon size={24} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AuditLogs;