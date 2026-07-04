import React, { useState } from 'react';
import { getDB, rupiah, nextJumat } from '../../helpers/store';

function Dashboard() {
  const [db] = useState(getDB());
  const month = new Date().toISOString().slice(0, 7);
  const kegiatanBulanIni = db.activities.filter((a) => a.date && a.date.startsWith(month)).length;
  const jumat = nextJumat(db);

  return (
    <>
      <h3 className="fw-bold mb-4">Dashboard</h3>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card stat-card p-3">
            <div className="text-muted small">Saldo Kas</div>
            <div className="h4 fw-bold mb-0">{rupiah(db.settings.kasTotal)}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card stat-card p-3">
            <div className="text-muted small">Kegiatan Bulan Ini</div>
            <div className="h4 fw-bold mb-0">{kegiatanBulanIni} kegiatan</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card stat-card p-3">
            <div className="text-muted small">Khatib Jumat Depan</div>
            <div className="h6 fw-bold mb-0">{jumat ? `${jumat.name} (${jumat.date})` : 'Belum diatur'}</div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white fw-bold">Log Aktivitas Terbaru</div>
            <ul className="list-group list-group-flush">
              {db.logs.length === 0 && <li className="list-group-item text-muted">Belum ada aktivitas</li>}
              {db.logs.slice(0, 10).map((l) => (
                <li className="list-group-item small" key={l.id}>
                  <strong>{l.user}</strong> — {l.action}
                  <div className="text-muted">{new Date(l.at).toLocaleString('id-ID')}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white fw-bold">Usulan / Kritik Warga</div>
            <ul className="list-group list-group-flush">
              {db.suggestions.length === 0 && <li className="list-group-item text-muted">Belum ada usulan masuk</li>}
              {db.suggestions.slice(0, 10).map((sg) => (
                <li className="list-group-item small" key={sg.id}>
                  <strong>{sg.name || 'Anonim'}</strong>: {sg.message}
                  <div className="text-muted">{new Date(sg.at).toLocaleString('id-ID')}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
