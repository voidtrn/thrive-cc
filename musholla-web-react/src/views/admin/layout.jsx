import React from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { currentUser, logout, can } from '../../helpers/auth';

const MENU = [
  { to: '/admin', module: 'dashboard', icon: 'bi-speedometer2', label: 'Dashboard', end: true },
  { to: '/admin/konten', module: 'content', icon: 'bi-megaphone', label: 'Konten Landing' },
  { to: '/admin/kegiatan', module: 'activities', icon: 'bi-calendar-event', label: 'Kegiatan & Khatib' },
  { to: '/admin/inventaris', module: 'inventory', icon: 'bi-box-seam', label: 'Inventaris' },
  { to: '/admin/zis', module: 'zis', icon: 'bi-cash-coin', label: 'ZIS & Bantuan' },
  { to: '/admin/pengurus', module: 'officers', icon: 'bi-people', label: 'Pengurus & User' },
];

function AdminLayout() {
  const user = currentUser();
  const navigate = useNavigate();

  const doLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="d-flex">
      <aside className="admin-sidebar p-3 no-print" style={{ width: 240, flexShrink: 0 }}>
        <div className="text-white fw-bold mb-1">
          <i className="bi bi-moon-stars-fill me-2" style={{ color: 'var(--emas)' }}></i>CMS Mushola
        </div>
        <div className="text-white-50 small mb-3">
          {user.name} · <span className="text-uppercase">{user.role}</span>
        </div>
        <nav className="nav flex-column gap-1">
          {MENU.filter((m) => can(user.role, m.module)).map((m) => (
            <NavLink key={m.to} to={m.to} end={m.end} className="nav-link px-3 py-2">
              <i className={`bi ${m.icon} me-2`}></i>{m.label}
            </NavLink>
          ))}
        </nav>
        <hr className="border-secondary" />
        <Link to="/" className="nav-link px-3 py-2 text-white-50">
          <i className="bi bi-house me-2"></i>Lihat Landing Page
        </Link>
        <button onClick={doLogout} className="btn btn-outline-light btn-sm w-100 mt-2">
          <i className="bi bi-box-arrow-right me-1"></i>Keluar
        </button>
      </aside>
      <main className="flex-grow-1 p-4" style={{ minWidth: 0 }}>
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
