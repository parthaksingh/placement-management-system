import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { api } from './api.js';
import './styles.css';

import Login from './pages/Login.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import Overview from './pages/admin/Overview.jsx';
import Students from './pages/admin/Students.jsx';
import Companies from './pages/admin/Companies.jsx';
import Drives from './pages/admin/Drives.jsx';
import Applications from './pages/admin/Applications.jsx';
import Interviews from './pages/admin/Interviews.jsx';
import Reports from './pages/admin/Reports.jsx';
import Notifications from './pages/admin/Notifications.jsx';
import { PageErrorBoundary } from './pages/admin/shared.jsx';

function AdminApp({ user, onSignOut }) {
  return (
    <AdminLayout user={user} onSignOut={onSignOut}>
      <PageErrorBoundary>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/students" element={<Students />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/placement-drives" element={<Drives />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/interview-rounds" element={<Interviews />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PageErrorBoundary>
    </AdminLayout>
  );
}

function App() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('placesmart_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [studentTab, setStudentTab] = useState('Overview');

  const handleLogin = (userData) => {
    localStorage.setItem('placesmart_user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleSignOut = () => {
    localStorage.removeItem('placesmart_token');
    localStorage.removeItem('placesmart_user');
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (user.role === 'ADMIN') {
    return <AdminApp user={user} onSignOut={handleSignOut} />;
  }

  return (
    <StudentDashboard
      user={user}
      tab={studentTab}
      setTab={setStudentTab}
      logout={handleSignOut}
    />
  );
}

const root = createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
