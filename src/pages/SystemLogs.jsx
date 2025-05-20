import React, { useEffect, useState } from 'react';

const fetchLogs = async (params = {}) => {
  const url = new URL('/api/system-logs', window.location.origin);
  Object.entries(params).forEach(([k,v]) => { if (v) url.searchParams.append(k,v); });
  const res = await fetch(url);
  return res.json();
};

const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type:'', action:'', adminId:'', start:'', end:'' });
  const [typeOptions] = useState(['USER', 'MESSAGE', 'REPORT', 'ERROR']);
  const [actionOptions] = useState(['CREATE_USER', 'UPDATE_USER', 'DELETE_USER', 'CREATE_MESSAGE', 'DELETE_MESSAGE', 'CREATE_REPORT', 'UPDATE_REPORT', 'ERROR']);

  const getLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchLogs(filters);
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    getLogs(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = e => {
    setFilters(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleFilter = e => {
    e.preventDefault();
    getLogs();
  };

  const handleClearFilters = () => {
    setFilters({ type:'', action:'', adminId:'', start:'', end:'' });
    getLogs();
  };

  // Helper to format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    try {
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleString();
      } else if (timestamp.seconds) {
        return new Date(timestamp.seconds * 1000).toLocaleString();
      }
      return timestamp.toString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Get badge color based on log type
  const getTypeBadgeColor = (type) => {
    const typeColors = {
      'USER': 'bg-blue-400/20 text-blue-400',
      'MESSAGE': 'bg-purple-400/20 text-purple-400',
      'REPORT': 'bg-orange-400/20 text-orange-400',
      'ERROR': 'bg-red-400/20 text-red-400'
    };
    return typeColors[type] || 'bg-gray-400/20 text-gray-400';
  };

  // Get badge color based on action
  const getActionBadgeColor = (action) => {
    if (action?.includes('CREATE')) return 'bg-green-400/20 text-green-400';
    if (action?.includes('UPDATE')) return 'bg-blue-400/20 text-blue-400';
    if (action?.includes('DELETE')) return 'bg-red-400/20 text-red-400';
    if (action?.includes('ERROR')) return 'bg-red-500/20 text-red-500';
    return 'bg-gray-400/20 text-gray-400';
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent mb-4 md:mb-0">
          System Logs
        </h1>
        <div className="text-slate-300 text-sm font-medium">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 mb-8 border border-white/10 shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-4">Filter Logs</h2>
        <form onSubmit={handleFilter} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Log Type</label>
              <select 
                name="type" 
                value={filters.type} 
                onChange={handleFilterChange}
                className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {typeOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Action Filter */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Action</label>
              <select 
                name="action" 
                value={filters.action} 
                onChange={handleFilterChange}
                className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Actions</option>
                {actionOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Admin ID */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Admin ID</label>
              <input 
                name="adminId" 
                value={filters.adminId} 
                onChange={handleFilterChange} 
                placeholder="Filter by admin ID" 
                className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Date Range</label>
              <div className="flex gap-2">
                <input 
                  name="start" 
                  type="date" 
                  value={filters.start} 
                  onChange={handleFilterChange}
                  className="w-1/2 px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input 
                  name="end" 
                  type="date" 
                  value={filters.end} 
                  onChange={handleFilterChange}
                  className="w-1/2 px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button 
              type="button" 
              onClick={handleClearFilters}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              Clear Filters
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-lg hover:from-blue-600 hover:to-cyan-500 transition-colors shadow-lg flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Apply Filters
            </button>
          </div>
        </form>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl border border-white/10 shadow-lg">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-slate-300">Loading system logs...</p>
            </div>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-xl font-semibold text-slate-300 mb-2">No logs found</p>
            <p className="text-slate-400">Try adjusting your filters or check back later</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead>
                <tr className="bg-white/5">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {logs.map((log, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white/5' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(log.type)}`}>
                        {log.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {log.adminId ? (
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white">
                            A
                          </div>
                          <div className="ml-3 text-sm text-slate-200">{log.adminId.substring(0, 8)}...</div>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <pre className="text-xs text-slate-300 bg-white/5 p-2 rounded-lg overflow-x-auto max-w-xs md:max-w-md lg:max-w-lg whitespace-pre-wrap">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemLogs; 