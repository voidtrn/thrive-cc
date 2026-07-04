import React, { useState } from 'react';
import { getDB, update, uid } from '../../helpers/store';
import { currentUser } from '../../helpers/auth';

const TABS = ['Kajian & Kegiatan', 'Khatib & Imam Jumat', 'Kalender Bulanan'];

function Activities() {
  const [tab, setTab] = useState(TABS[0]);
  const [db, setDb] = useState(getDB());
  const user = currentUser();
  const save = (mutator, action) => {
    update(mutator, action, user.name);
    setDb(getDB());
  };

  return (
    <>
      <h3 className="fw-bold mb-3">Kegiatan & Khatib</h3>
      <ul className="nav nav-tabs mb-3 no-print">
        {TABS.map((t) => (
          <li className="nav-item" key={t}>
            <button className={`nav-link ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
          </li>
        ))}
      </ul>

      {tab === 'Kajian & Kegiatan' && <Kajian db={db} save={save} />}
      {tab === 'Khatib & Imam Jumat' && <Khatib db={db} save={save} />}
      {tab === 'Kalender Bulanan' && <Kalender db={db} />}
    </>
  );
}

function Kajian({ db, save }) {
  const empty = { title: '', speaker: '', date: '', time: '', type: 'kajian' };
  const [form, setForm] = useState(empty);

  const add = (e) => {
    e.preventDefault();
    save((d) => d.activities.unshift({ id: uid(), ...form }), `Tambah kegiatan: ${form.title}`);
    setForm(empty);
  };

  const remove = (id) => save((d) => { d.activities = d.activities.filter((a) => a.id !== id); }, 'Hapus kegiatan');

  return (
    <>
      <form onSubmit={add} className="card border-0 shadow-sm p-3 mb-3">
        <div className="row g-2">
          <div className="col-md-3"><input className="form-control" placeholder="Judul" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="col-md-3"><input className="form-control" placeholder="Pemateri" value={form.speaker} onChange={(e) => setForm({ ...form, speaker: e.target.value })} /></div>
          <div className="col-md-2"><input className="form-control" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          <div className="col-md-2"><input className="form-control" placeholder="Jam / jadwal" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
          <div className="col-md-1">
            <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="kajian">Kajian</option>
              <option value="rutin">Rutin</option>
            </select>
          </div>
          <div className="col-md-1"><button className="btn btn-hijau w-100">+</button></div>
        </div>
      </form>
      <table className="table table-hover bg-white shadow-sm">
        <thead><tr><th>Judul</th><th>Pemateri</th><th>Tanggal</th><th>Jam</th><th>Tipe</th><th></th></tr></thead>
        <tbody>
          {db.activities.map((a) => (
            <tr key={a.id}>
              <td>{a.title}</td><td>{a.speaker}</td><td>{a.date || '—'}</td><td>{a.time}</td>
              <td><span className={`badge ${a.type === 'rutin' ? 'bg-info' : 'bg-success'}`}>{a.type}</span></td>
              <td><button className="btn btn-sm btn-outline-danger" onClick={() => remove(a.id)}><i className="bi bi-trash"></i></button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function Khatib({ db, save }) {
  const empty = { name: '', origin: '', phone: '', date: '', imam: '' };
  const [form, setForm] = useState(empty);

  const add = (e) => {
    e.preventDefault();
    save((d) => d.khatibList.push({ id: uid(), ...form }), `Jadwalkan khatib: ${form.name} (${form.date})`);
    setForm(empty);
  };

  const remove = (id) => save((d) => { d.khatibList = d.khatibList.filter((k) => k.id !== id); }, 'Hapus jadwal khatib');

  const sorted = [...db.khatibList].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <>
      <form onSubmit={add} className="card border-0 shadow-sm p-3 mb-3">
        <div className="row g-2">
          <div className="col-md-3"><input className="form-control" placeholder="Nama khatib" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="col-md-2"><input className="form-control" placeholder="Asal" value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} /></div>
          <div className="col-md-2"><input className="form-control" placeholder="No. HP (62…)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="col-md-2"><input className="form-control" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          <div className="col-md-2"><input className="form-control" placeholder="Imam" value={form.imam} onChange={(e) => setForm({ ...form, imam: e.target.value })} /></div>
          <div className="col-md-1"><button className="btn btn-hijau w-100">+</button></div>
        </div>
      </form>
      <table className="table table-hover bg-white shadow-sm">
        <thead><tr><th>Tanggal Jumat</th><th>Khatib</th><th>Asal</th><th>Imam</th><th>Kontak</th><th></th></tr></thead>
        <tbody>
          {sorted.map((k) => (
            <tr key={k.id}>
              <td>{k.date}</td><td>{k.name}</td><td>{k.origin}</td><td>{k.imam}</td>
              <td>{k.phone && <a href={`https://wa.me/${k.phone}`} target="_blank" rel="noreferrer" className="btn btn-sm wa-btn"><i className="bi bi-whatsapp"></i></a>}</td>
              <td><button className="btn btn-sm btn-outline-danger" onClick={() => remove(k.id)}><i className="bi bi-trash"></i></button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function Kalender({ db }) {
  const month = new Date().toISOString().slice(0, 7);
  const monthName = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const items = [
    ...db.activities.filter((a) => a.date && a.date.startsWith(month)).map((a) => ({ date: a.date, label: `${a.title} — ${a.speaker} (${a.time})` })),
    ...db.khatibList.filter((k) => k.date.startsWith(month)).map((k) => ({ date: k.date, label: `Sholat Jumat — Khatib ${k.name}` })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="card border-0 shadow-sm p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">Kalender Kegiatan — {monthName}</h5>
        <button className="btn btn-hijau btn-sm no-print" onClick={() => window.print()}>
          <i className="bi bi-printer me-1"></i>Cetak / Unduh
        </button>
      </div>
      {items.length === 0 ? (
        <p className="text-muted">Belum ada kegiatan terjadwal bulan ini.</p>
      ) : (
        <table className="table">
          <thead><tr><th style={{ width: 140 }}>Tanggal</th><th>Kegiatan</th></tr></thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i}>
                <td>{new Date(it.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}</td>
                <td>{it.label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Activities;
