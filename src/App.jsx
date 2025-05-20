import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import Analytics from './pages/Analytics';
import SystemLogs from './pages/SystemLogs';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './config/firebase';
import './App.css';

function PrivateRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const adminDoc = await getDoc(doc(db, 'admin_users', user.uid));
        setIsAdmin(adminDoc.exists() && adminDoc.data().status === 'ACTIVE');
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;
  return isAdmin ? children : <Navigate to="/login" />;
}

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <>
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
        <Route path="/users" element={<PrivateRoute><UserManagement /></PrivateRoute>} />
        <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
        <Route path="/logs" element={<PrivateRoute><SystemLogs /></PrivateRoute>} />
        <Route path="*" element={<Navigate to={auth.currentUser ? "/dashboard" : "/login"} />} />
      </Routes>
    </>
  );
}

export default App;
