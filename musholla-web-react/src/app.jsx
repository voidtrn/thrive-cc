import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { currentUser } from './helpers/auth';
import Home from './views/landing/home';
import Login from './views/admin/login';
import AdminLayout from './views/admin/layout';
import Dashboard from './views/admin/dashboard';
import Content from './views/admin/content';
import Activities from './views/admin/activities';
import Inventory from './views/admin/inventory';
import Zis from './views/admin/zis';
import Officers from './views/admin/officers';

function RequireAuth({ children }) {
  const location = useLocation();
  if (!currentUser()) return <Navigate to="/admin/login" state={{ from: location }} replace />;
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="konten" element={<Content />} />
        <Route path="kegiatan" element={<Activities />} />
        <Route path="inventaris" element={<Inventory />} />
        <Route path="zis" element={<Zis />} />
        <Route path="pengurus" element={<Officers />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
