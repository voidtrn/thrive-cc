import React, { useState } from 'react';
import { getDB, update, uid } from '../../helpers/store';
import { currentUser } from '../../helpers/auth';

function Inventory() {
  const [db, setDb] = useState(getDB());
  const user = currentUser();
  const empty = { name: '', qty: 1, condition: 'Baik' };
  const [form, setForm] = useState(empty);
  const [repairFor, setRepairFor] = useState(null);
  const [repairNote, setRepairNote] = useState('');

  const save = (mutator, action) => {
    update(mutator, action, user.name);
    setDb(getDB());
  };

  const add = (e) => {
    e.preventDefault();
    save((d) => d.inventory.push({ id: uid(), ...form, qty: Number(form.qty), history: [] }), `Tambah inventaris: ${form.name}`);
    setForm(empty);
  };

  const remove = (id) => save((d) => { d.inventory = d.inventory.filter((i) => i.id !== id); }, 'Hapus item inventaris');

  const setCondition = (id, condition) =>
    save((d) => { d.inventory.find((i) => i.id === id).condition = condition; }, `Update kondisi inventaris`);

  const addRepair = (e) => {
    e.preventDefault();
    save((d) => {
      d.inventory.find((i) => i.id === repairFor).history.unshift({ date: new Date().toISOString().slice(0, 10), note: repairNote });
    }, `Catat perbaikan inventaris`);
    setRepairFor(null);
    setRepairNote('');
  };

  return (
    <>
      <h3 className="fw-bold mb-3">Inventaris Mushola</h3>
      <p className="text-muted">Catat semua aset agar warga tahu dan tidak terjadi pembelian ganda.</p>

      <form onSubmit={add} className="card border-0 shadow-sm p-3 mb-3">
        <div className="row g-2">
          <div className="col-md-5"><input className="form-control" placeholder="Nama barang" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="col-md-2"><input className="form-control" type="number" min="1" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} /></div>
          <div className="col-md-3"><input className="form-control" placeholder="Kondisi" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} /></div>
          <div className="col-md-2"><button className="btn btn-hijau w-100">Tambah</button></div>
        </div>
      </form>

      {repairFor && (
        <form onSubmit={addRepair} className="alert alert-warning d-flex gap-2 align-items-center">
          <span className="fw-bold">Catat perbaikan:</span>
          <input className="form-control" placeholder="Contoh: servis dinamo kipas" required autoFocus
            value={repairNote} onChange={(e) => setRepairNote(e.target.value)} />
          <button className="btn btn-hijau btn-sm">Simpan</button>
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setRepairFor(null)}>Batal</button>
        </form>
      )}

      <table className="table table-hover bg-white shadow-sm align-middle">
        <thead><tr><th>Barang</th><th>Jumlah</th><th>Kondisi</th><th>Riwayat Perbaikan</th><th></th></tr></thead>
        <tbody>
          {db.inventory.map((it) => (
            <tr key={it.id}>
              <td className="fw-bold">{it.name}</td>
              <td>{it.qty}</td>
              <td>
                <input className="form-control form-control-sm" style={{ maxWidth: 160 }}
                  defaultValue={it.condition} onBlur={(e) => e.target.value !== it.condition && setCondition(it.id, e.target.value)} />
              </td>
              <td className="small">
                {it.history.length === 0 ? <span className="text-muted">—</span> :
                  it.history.map((h, i) => <div key={i}>{h.date}: {h.note}</div>)}
              </td>
              <td className="text-nowrap">
                <button className="btn btn-sm btn-outline-primary me-1" title="Catat perbaikan" onClick={() => setRepairFor(it.id)}>
                  <i className="bi bi-tools"></i>
                </button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => remove(it.id)}>
                  <i className="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default Inventory;
