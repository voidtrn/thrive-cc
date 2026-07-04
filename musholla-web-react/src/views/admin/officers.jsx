import React, { useState } from 'react';
import { getDB, update, uid } from '../../helpers/store';
import { currentUser } from '../../helpers/auth';

function Officers() {
  const [db, setDb] = useState(getDB());
  const user = currentUser();
  const isAdmin = user.role === 'admin';

  const save = (mutator, action) => {
    update(mutator, action, user.name);
    setDb(getDB());
  };

  return (
    <>
      <h3 className="fw-bold mb-3">Pengurus & User</h3>
      <div className="row g-4">
        <div className="col-lg-7">
          <StrukturDKM db={db} save={save} />
        </div>
        <div className="col-lg-5">
          {isAdmin ? <UserManagement db={db} save={save} /> : (
            <div className="alert alert-secondary">Manajemen user login hanya untuk Admin.</div>
          )}
        </div>
      </div>
    </>
  );
}

function StrukturDKM({ db, save }) {
  const empty = { name: '', role: '', phone: '', photo: '' };
  const [form, setForm] = useState(empty);

  const onPhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm({ ...form, photo: reader.result });
    reader.readAsDataURL(file);
  };

  const add = (e) => {
    e.preventDefault();
    save((d) => d.officers.push({ id: uid(), ...form }), `Tambah pengurus: ${form.name} (${form.role})`);
    setForm(empty);
  };

  const remove = (id) => save((d) => { d.officers = d.officers.filter((o) => o.id !== id); }, 'Hapus pengurus');

  return (
    <div className="card border-0 shadow-sm p-3">
      <h5 className="fw-bold">Struktur DKM</h5>
      <form onSubmit={add} className="row g-2 mb-3">
        <div className="col-md-4"><input className="form-control" placeholder="Nama" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div className="col-md-3"><input className="form-control" placeholder="Jabatan" required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></div>
        <div className="col-md-3"><input className="form-control" placeholder="No. HP (62…)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        <div className="col-md-2"><button className="btn btn-hijau w-100">+</button></div>
        <div className="col-12"><input className="form-control form-control-sm" type="file" accept="image/*" onChange={onPhoto} /></div>
      </form>
      <ul className="list-group">
        {db.officers.map((o) => (
          <li className="list-group-item d-flex align-items-center gap-3" key={o.id}>
            {o.photo ? (
              <img src={o.photo} alt={o.name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: '50%' }} />
            ) : (
              <i className="bi bi-person-circle fs-2 text-secondary"></i>
            )}
            <div className="flex-grow-1">
              <strong>{o.name}</strong>
              <div className="small text-muted">{o.role}</div>
            </div>
            {o.phone && (
              <a href={`https://wa.me/${o.phone}`} target="_blank" rel="noreferrer" className="btn btn-sm wa-btn">
                <i className="bi bi-whatsapp"></i>
              </a>
            )}
            <button className="btn btn-sm btn-outline-danger" onClick={() => remove(o.id)}>
              <i className="bi bi-trash"></i>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function UserManagement({ db, save }) {
  const empty = { username: '', password: '', name: '', role: 'marbot' };
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  const add = (e) => {
    e.preventDefault();
    if (db.users.some((u) => u.username === form.username)) {
      setError('Username sudah dipakai');
      return;
    }
    setError('');
    save((d) => d.users.push({ ...form }), `Tambah user login: ${form.username} (${form.role})`);
    setForm(empty);
  };

  const remove = (username) => {
    if (username === 'admin') return;
    save((d) => { d.users = d.users.filter((u) => u.username !== username); }, `Hapus user: ${username}`);
  };

  return (
    <div className="card border-0 shadow-sm p-3">
      <h5 className="fw-bold">User Login CMS</h5>
      <p className="small text-muted mb-2">
        Admin: semua modul · Bendahara: ZIS + inventaris · Marbot: konten + kegiatan
      </p>
      {error && <div className="alert alert-danger py-1 small">{error}</div>}
      <form onSubmit={add} className="row g-2 mb-3">
        <div className="col-6"><input className="form-control" placeholder="Username" required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></div>
        <div className="col-6"><input className="form-control" placeholder="Password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
        <div className="col-6"><input className="form-control" placeholder="Nama" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div className="col-3">
          <select className="form-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="admin">Admin</option>
            <option value="bendahara">Bendahara</option>
            <option value="marbot">Marbot</option>
          </select>
        </div>
        <div className="col-3"><button className="btn btn-hijau w-100">+</button></div>
      </form>
      <ul className="list-group">
        {db.users.map((u) => (
          <li className="list-group-item d-flex justify-content-between align-items-center" key={u.username}>
            <span>
              <strong>{u.username}</strong>
              <span className="badge bg-secondary ms-2">{u.role}</span>
              <div className="small text-muted">{u.name}</div>
            </span>
            {u.username !== 'admin' && (
              <button className="btn btn-sm btn-outline-danger" onClick={() => remove(u.username)}>
                <i className="bi bi-trash"></i>
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Officers;
