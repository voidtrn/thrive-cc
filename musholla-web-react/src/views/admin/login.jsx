import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { login } from '../../helpers/auth';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const user = login(form.username, form.password);
    if (!user) {
      setError('Username atau password salah');
      return;
    }
    navigate(location.state?.from?.pathname || '/admin', { replace: true });
  };

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div className="card border-0 shadow p-4" style={{ maxWidth: 380, width: '100%' }}>
        <div className="text-center mb-3">
          <i className="bi bi-moon-stars-fill fs-1" style={{ color: 'var(--hijau)' }}></i>
          <h4 className="fw-bold mt-2">Login Pengurus</h4>
        </div>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <form onSubmit={submit}>
          <input
            className="form-control mb-2"
            placeholder="Username"
            autoFocus
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          <input
            className="form-control mb-3"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button className="btn btn-hijau w-100">Masuk</button>
        </form>
        <div className="text-muted small mt-3">
          Demo: admin/admin123 · bendahara/bendahara123 · marbot/marbot123
        </div>
        <Link to="/" className="small mt-2">← Kembali ke beranda</Link>
      </div>
    </div>
  );
}

export default Login;
