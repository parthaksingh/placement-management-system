import React from 'react';
import { NavLink } from 'react-router-dom';

const adminRoutes = [
  { path: '/', label: 'Overview', end: true },
  { path: '/students', label: 'Students' },
  { path: '/companies', label: 'Companies' },
  { path: '/placement-drives', label: 'Placement Drives' },
  { path: '/applications', label: 'Applications' },
  { path: '/interview-rounds', label: 'Interview Rounds' },
  { path: '/reports', label: 'Reports' },
  { path: '/notifications', label: 'Notifications' }
];

export default function AdminLayout({ user, onSignOut, children }) {
  return (
    <div className="app">
      <aside>
        <div className="brand">
          place<span>SMART</span>
          <small>ADMINISTRATOR</small>
        </div>
        <nav>
          {adminRoutes.map(r => (
            <NavLink key={r.path} to={r.path} end={r.end} className={({ isActive }) => isActive ? 'active' : ''}>
              {r.label}
            </NavLink>
          ))}
        </nav>
        <button className="signout" onClick={onSignOut}>Sign out</button>
      </aside>
      <main className="workspace">
        <div className="topline">
          <span>PLACEMENT CELL / ADMINISTRATOR</span>
          <b>{user?.name || 'Administrator'}</b>
        </div>
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
}
