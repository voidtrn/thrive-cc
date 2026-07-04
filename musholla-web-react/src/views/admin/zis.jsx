import React, { useState } from 'react';
import { getDB, update, uid, rupiah } from '../../helpers/store';
import { currentUser } from '../../helpers/auth';

const IURAN_URL = import.meta.env.VITE_IURAN_URL || '';

function Zis() {
  const [db, setDb] = useState(getDB());
  const user = currentUser();
  const empty = { name: '', type: 'Warga kurang mampu', reason: '' };
  const [form, setForm] = useState(empty);

  const save = (mutator, action) => {
    update(mutator, action, user.name);
    setDb(getDB());
  };

  const addRequest = (e) => {
    e.preventDefault();
    save((d) => d.aidRequests.unshift({ id: uid(), ...form, status: 'menunggu', at: new Date().toISOString() }),
      `Pengajuan bantuan: ${form.name}`);
    setForm(empty);
  };

  const setStatus = (id, status) =>
    save((d) => { d.aidRequests.find((r) => r.id === id).status = status; }, `Review pengajuan bantuan: ${status}`);

  const updateKas = (e) => {
    e.preventDefault();
    const val = Number(e.target.kas.value);
    save((d) => { d.settings.kasTotal = val; }, `Update saldo kas manual: ${rupiah(val)}`);
  };

  const badge = { menunggu: 'bg-warning text-dark', disetujui: 'bg-success', ditolak: 'bg-danger' };

  return (
    <>
      <h3 className="fw-bold mb-3">ZIS — Zakat, Infaq, Sedekah</h3>

      {/* Panel jembatan ke web iuran utama */}
      <div className="card border-0 shadow-sm p-3 mb-4">
        <div className="d-md-flex justify-content-between align-items-center">
          <div>
            <div className="text-muted small">Saldo Kas (sinkron dari web iuran utama)</div>
            <div className="h3 fw-bold mb-0">{rupiah(db.settings.kasTotal)}</div>
          </div>
          {IURAN_URL ? (
            <a href={IURAN_URL} target="_blank" rel="noreferrer" className="btn btn-hijau mt-2 mt-md-0">
              Buka Web Iuran <i className="bi bi-box-arrow-up-right ms-1"></i>
            </a>
          ) : (
            <span className="text-muted small">Set VITE_IURAN_URL di .env untuk link ke web iuran</span>
          )}
        </div>
        <hr />
        <form onSubmit={updateKas} className="d-flex gap-2" style={{ maxWidth: 420 }}>
          <input className="form-control" name="kas" type="number" placeholder="Update saldo manual (fallback tanpa API)" required />
          <button className="btn btn-outline-success">Simpan</button>
        </form>
        <div className="form-text">Kalau API web iuran sudah tersedia, isi VITE_IURAN_API di .env — angka di atas akan tarik otomatis.</div>
      </div>

      {/* Pengajuan bantuan */}
      <h5 className="fw-bold mb-2">Pengajuan Bantuan</h5>
      <form onSubmit={addRequest} className="card border-0 shadow-sm p-3 mb-3">
        <div className="row g-2">
          <div className="col-md-3"><input className="form-control" placeholder="Nama pemohon" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="col-md-3">
            <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option>Warga kurang mampu</option>
              <option>Anak yatim</option>
              <option>Biaya pendidikan</option>
              <option>Kesehatan / berobat</option>
              <option>Lainnya</option>
            </select>
          </div>
          <div className="col-md-4"><input className="form-control" placeholder="Alasan / keterangan" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></div>
          <div className="col-md-2"><button className="btn btn-hijau w-100">Ajukan</button></div>
        </div>
      </form>

      <table className="table table-hover bg-white shadow-sm align-middle">
        <thead><tr><th>Pemohon</th><th>Jenis</th><th>Keterangan</th><th>Status</th><th>Review</th></tr></thead>
        <tbody>
          {db.aidRequests.length === 0 && (
            <tr><td colSpan="5" className="text-muted">Belum ada pengajuan.</td></tr>
          )}
          {db.aidRequests.map((r) => (
            <tr key={r.id}>
              <td className="fw-bold">{r.name}</td>
              <td>{r.type}</td>
              <td>{r.reason}</td>
              <td><span className={`badge ${badge[r.status]}`}>{r.status}</span></td>
              <td className="text-nowrap">
                {r.status === 'menunggu' && (
                  <>
                    <button className="btn btn-sm btn-success me-1" onClick={() => setStatus(r.id, 'disetujui')}>Setujui</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => setStatus(r.id, 'ditolak')}>Tolak</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default Zis;
