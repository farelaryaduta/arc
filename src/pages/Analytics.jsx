import React, { useEffect, useState } from 'react';

const fetchData = async (url) => {
  const res = await fetch(url);
  return res.json();
};

const Analytics = () => {
  const [userStats, setUserStats] = useState(null);
  const [msgStats, setMsgStats] = useState(null);
  const [reportStats, setReportStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getStats = async () => {
      setLoading(true);
      try {
        const [u, m, r] = await Promise.all([
          fetchData('/api/users/analytics/summary'),
          fetchData('/api/messages/analytics/summary'),
          fetchData('/api/reports/analytics/summary'),
        ]);
        setUserStats(u);
        setMsgStats(m);
        setReportStats(r);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    getStats();
  }, []);

  // Simple chart rendering helpers
  const renderBarChart = (data, label, color = 'bg-gradient-to-r from-blue-500 to-cyan-400') => {
    if (!data || Object.keys(data).length === 0) {
      return (
        <div className="flex flex-col items-center justify-center bg-white/5 p-6 rounded-lg h-64">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
          <p className="text-slate-500">No data available for {label}</p>
        </div>
      );
    }
    
    const keys = Object.keys(data).sort();
    const max = Math.max(...Object.values(data));
    return (
      <div className="bg-white/5 p-6 rounded-lg shadow-inner">
        <div className="font-semibold text-lg text-white mb-4">{label}</div>
        <div className="flex items-end gap-2 h-48 mt-4 overflow-x-auto pb-2">
          {keys.map(k => (
            <div key={k} className="flex flex-col items-center min-w-[40px]">
              <div 
                className={`${color} w-8 rounded-t-lg transition-all duration-500 ease-in-out hover:opacity-80`} 
                style={{height: `${(data[k]/max)*100}%`}}
              ></div>
              <div className="text-xs text-slate-400 mt-2 rotate-45 origin-left whitespace-nowrap">{k}</div>
              <div className="text-sm font-semibold text-white mt-1">{data[k]}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Loading state with animation
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-slate-300">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent mb-4 md:mb-0">
          Analytics Dashboard
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

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl p-6 shadow-lg flex flex-col transform hover:scale-105 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-white text-opacity-80 text-sm">Total Users</div>
              <div className="text-white text-3xl font-bold mt-1">{userStats?.total || 0}</div>
            </div>
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-2 text-white text-opacity-80 text-xs">
            {userStats?.active ? `${userStats.active} Active in Last 30 Days` : 'Activity data not available'}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 shadow-lg flex flex-col transform hover:scale-105 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-white text-opacity-80 text-sm">Total Messages</div>
              <div className="text-white text-3xl font-bold mt-1">{msgStats?.total || 0}</div>
            </div>
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
          </div>
          <div className="mt-2 text-white text-opacity-80 text-xs">
            {Object.keys(msgStats?.perMonth || {}).length > 0 
              ? `${Object.values(msgStats.perMonth).reduce((a, b) => a + b, 0)} Messages This Year` 
              : 'Monthly data not available'}
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-orange-500 rounded-xl p-6 shadow-lg flex flex-col transform hover:scale-105 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-white text-opacity-80 text-sm">Total Reports</div>
              <div className="text-white text-3xl font-bold mt-1">{reportStats?.total || 0}</div>
            </div>
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <div className="mt-2 text-white text-opacity-80 text-xs">
            {Object.keys(reportStats?.perMonth || {}).length > 0 
              ? `${Object.values(reportStats.perMonth).reduce((a, b) => a + b, 0)} Reports This Year` 
              : 'Monthly data not available'}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* User Growth */}
        <div>
          <h2 className="text-xl font-semibold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-4">User Growth</h2>
          {renderBarChart(userStats?.growth, 'User Growth (per month)', 'bg-gradient-to-r from-blue-500 to-cyan-400')}
        </div>
        
        {/* Messages Sent */}
        <div>
          <h2 className="text-xl font-semibold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-4">Messages Sent</h2>
          {renderBarChart(msgStats?.perMonth, 'Messages Sent (per month)', 'bg-gradient-to-r from-purple-500 to-pink-500')}
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Users */}
        <div className="bg-white/5 rounded-lg shadow-inner p-6">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-4">Top Users by Message Count</h2>
          {msgStats?.topUsers && msgStats.topUsers.length > 0 ? (
            <table className="min-w-full divide-y divide-white/10">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Messages</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {msgStats.topUsers.map((u, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white/5' : ''}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white">
                          {u.user?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="ml-3 text-sm text-slate-200">{u.user}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-slate-300">{u.count}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center h-40">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <p className="text-slate-500">No user activity data available</p>
            </div>
          )}
        </div>

        {/* Most Reported Users */}
        <div className="bg-white/5 rounded-lg shadow-inner p-6">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-4">Most Reported Users</h2>
          {reportStats?.mostReported && reportStats.mostReported.length > 0 ? (
            <table className="min-w-full divide-y divide-white/10">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Reports</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {reportStats.mostReported.map((u, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white/5' : ''}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center text-white">
                          {u.user?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="ml-3 text-sm text-slate-200">{u.user}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-slate-300">{u.count}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center h-40">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-slate-500">No report data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics; 