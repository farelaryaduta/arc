import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../config/firebase.js';
import { signOut } from 'firebase/auth';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import '../index.css'

// Navigation items for the sidebar
const navItems = [
  { 
    path: '/dashboard', 
    label: 'Dashboard', 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
        <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
      </svg>
    )
  },
  { 
    path: '/users', 
    label: 'User Management', 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
      </svg>
    )
  },
  { 
    path: '/settings', 
    label: 'Settings', 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
      </svg>
    )
  },
  { 
    path: '/analytics', 
    label: 'Analytics', 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
      </svg>
    )
  },
  { 
    path: '/logs', 
    label: 'System Logs', 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
      </svg>
    )
  },
];

const AdminDashboard = () => {
  const [userCount, setUserCount] = useState(0);
  const [recentAdmins, setRecentAdmins] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 768);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      // Count users
      const usersSnap = await getDocs(collection(db, 'users'));
      setUserCount(usersSnap.size);
      // User growth (simulate by grouping users by createdAt month)
      const users = usersSnap.docs.map(doc => doc.data());
      const growthMap = {};
      users.forEach(user => {
        if (user.createdAt && user.createdAt.toDate) {
          const date = user.createdAt.toDate();
          const month = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}`;
          growthMap[month] = (growthMap[month] || 0) + 1;
        }
      });
      const growthArr = Object.entries(growthMap).map(([month, count]) => ({ month, count }));
      growthArr.sort((a, b) => a.month.localeCompare(b.month));
      setUserGrowth(growthArr);
      // Recent admin logins
      const q = query(collection(db, 'admin_users'), orderBy('lastLogin', 'desc'), limit(5));
      const recentSnap = await getDocs(q);
      setRecentAdmins(recentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      // Recent activity (simulate with recent admins)
      setRecentActivity(recentSnap.docs.map(doc => ({
        id: doc.id,
        type: 'Admin Login',
        user: doc.data().username,
        time: doc.data().lastLogin?.toDate?.().toLocaleString?.() || ''
      })));
      setLoading(false);
    };
    fetchStats();
  }, []);

  const handleLogout = async () => {
    try {
      // Sign out from Firebase Auth
      await signOut(auth);
      
      // Redirect to login page
      navigate('/login');
      
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="p-2 rounded-lg bg-slate-700/80 backdrop-blur-sm border border-white/10 shadow-lg"
        >
          {isMobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div 
        className={`${isMobileMenuOpen ? 'fixed inset-0 z-40' : 'hidden md:block'} 
                  ${isSidebarCollapsed ? 'md:w-20' : 'md:w-64'} 
                  bg-slate-800/80 backdrop-blur-lg transition-all duration-300 flex flex-col border-r border-white/10
                  overflow-y-auto overflow-x-hidden`}
      >
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          {!isSidebarCollapsed && (
            <h2 className="text-xl font-bold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
              Admin Panel
            </h2>
          )}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors hidden md:block"
          >
            {isSidebarCollapsed ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User Profile */}
        <div className={`p-4 ${isSidebarCollapsed ? 'items-center' : ''} border-b border-white/10 flex ${isSidebarCollapsed ? 'justify-center' : 'items-center'}`}>
          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white font-semibold">
            A
          </div>
          {!isSidebarCollapsed && (
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Admin User</p>
              <p className="text-xs text-slate-400">admin@example.com</p>
            </div>
          )}
        </div>
        
        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 text-slate-300 hover:bg-white/10 transition-colors ${
                location.pathname === item.path ? 'bg-white/10 border-l-4 border-blue-400' : ''
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className={`${isSidebarCollapsed ? 'mx-auto' : 'mr-3'}`}>{item.icon}</span>
              {!isSidebarCollapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link
            to="/"
            className="flex items-center text-slate-300 hover:text-white transition-colors py-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isSidebarCollapsed ? 'mx-auto' : 'mr-3'}`} viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            {!isSidebarCollapsed && <span>Home</span>}
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center text-slate-300 hover:text-white transition-colors py-2 w-full mt-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isSidebarCollapsed ? 'mx-auto' : 'mr-3'}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4a1 1 0 10-2 0v4.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L14 11.586V7z" clipRule="evenodd" />
            </svg>
            {!isSidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent mb-2 md:mb-0">
              Dashboard Overview
            </h1>
            <div className="text-slate-300 text-sm font-medium">
              {new Date().toLocaleDateString()}
            </div>
          </div>
          {loading ? <p className="text-center text-lg text-slate-300">Loading...</p> : (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                <div className="rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg p-7 flex flex-col items-start">
                  <span className="text-lg font-semibold mb-2">Total Users</span>
                  <span className="text-4xl font-extrabold">{userCount}</span>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-green-400 to-blue-500 shadow-lg p-7 flex flex-col items-start">
                  <span className="text-lg font-semibold mb-2">Active Admins</span>
                  <span className="text-4xl font-extrabold">{recentAdmins.length}</span>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-pink-500 to-yellow-400 shadow-lg p-7 flex flex-col items-start">
                  <span className="text-lg font-semibold mb-2">Recent Logins</span>
                  <span className="text-4xl font-extrabold">{recentActivity.length}</span>
                </div>
              </div>
              {/* Main Content: Chart + Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="col-span-2 bg-white/10 rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">User Growth</h2>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={userGrowth} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="month" stroke="#fff" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#fff" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip contentStyle={{ background: '#1e293b', border: 'none', color: '#fff' }} />
                        <Line type="monotone" dataKey="count" stroke="#38bdf8" strokeWidth={3} dot={{ r: 5, fill: '#38bdf8' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-white/10 rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
                  <ul className="divide-y divide-white/10">
                    {recentActivity.length === 0 && <li className="text-slate-300">No recent activity.</li>}
                    {recentActivity.map((act, idx) => (
                      <li key={idx} className="py-3">
                        <span className="font-semibold text-cyan-400">{act.user}</span> <span className="text-white/80">{act.type}</span>
                        <div className="text-xs text-slate-400 mt-1">{act.time}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
