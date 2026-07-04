import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDB, update, uid, rupiah, activeAnnouncements, nextJumat } from '../../helpers/store';
import { getPrayerTimes, nextPrayerName } from '../../helpers/prayerTimes';

const IURAN_URL = import.meta.env.VITE_IURAN_URL || '#';

function Home() {
  const [db, setDb] = useState(getDB());
  const [times, setTimes] = useState(null);

  useEffect(() => {
    getPrayerTimes(db.prayerConfig).then(setTimes);
  }, []);

  const s = db.settings;
  const jumat = nextJumat(db);
  const announcements = activeAnnouncements(db);
  const rutin = db.activities.filter((a) => a.type === 'rutin');
  const next = times ? nextPrayerName(times) : null;

  return (
    <>
      {/* Running text pengumuman */}
      {announcements.length > 0 && (
        <div className="running-text">
          <span>
            {announcements.map((a) => `📢 ${a.text}`).join('   •   ')}
          </span>
        </div>
      )}

      {/* Header */}
      <header className="hero py-5">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-md-7">
              <div className="d-flex align-items-center gap-3 mb-2">
                <i className="bi bi-moon-stars-fill fs-1" style={{ color: 'var(--emas)' }}></i>
                <h1 className="fw-bold mb-0">{s.nama}</h1>
              </div>
              <p className="lead mb-3">{s.tagline}</p>
              <a href={IURAN_URL} target="_blank" rel="noreferrer" className="btn btn-warning fw-bold me-2">
                <i className="bi bi-journal-text me-1"></i>Laporan Keuangan
              </a>
              <Link to="/admin" className="btn btn-outline-light">
                <i className="bi bi-lock me-1"></i>Login Pengurus
              </Link>
            </div>
            <div className="col-md-5 text-center">
              {s.foto ? (
                <img src={s.foto} alt={s.nama} className="mosque-photo w-100" />
              ) : (
                <i className="bi bi-house-heart-fill" style={{ fontSize: '9rem', color: 'rgba(255,255,255,.4)' }}></i>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container py-4">
        {/* Jadwal sholat */}
        <section className="mb-5">
          <h2 className="section-title h4 mb-3">Jadwal Sholat Hari Ini</h2>
          {!times ? (
            <p className="text-muted">Memuat jadwal…</p>
          ) : (
            <div className="row g-2 text-center">
              <div className="col-6 col-md-2">
                <div className="prayer-card p-3">
                  <div className="small text-muted">Imsak</div>
                  <div className="time">{times.imsak || s.imsak}</div>
                </div>
              </div>
              {['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'].map((p) => (
                <div className="col-6 col-md-2" key={p}>
                  <div className={`prayer-card p-3 ${next === p ? 'next' : ''}`}>
                    <div className={`small ${next === p ? '' : 'text-muted'} text-capitalize`}>{p}</div>
                    <div className="time">{times[p]}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {jumat && (
            <div className="alert alert-success mt-3 mb-0">
              <i className="bi bi-calendar-week me-2"></i>
              <strong>Sholat Jumat {jumat.date}</strong> — Khatib: {jumat.name} ({jumat.origin}), Imam: {jumat.imam}
            </div>
          )}
        </section>

        {/* Kas highlight */}
        <section className="mb-5">
          <div className="kas-highlight p-4 d-md-flex justify-content-between align-items-center">
            <div>
              <div className="text-uppercase small fw-bold opacity-75">Total Kas / Infaq Terkumpul</div>
              <div className="display-6 fw-bold">{rupiah(s.kasTotal)}</div>
            </div>
            <a href={IURAN_URL} target="_blank" rel="noreferrer" className="btn btn-light fw-bold mt-3 mt-md-0">
              Lihat Rincian <i className="bi bi-arrow-right"></i>
            </a>
          </div>
        </section>

        {/* Kegiatan rutin */}
        <section className="mb-5">
          <h2 className="section-title h4 mb-3">Kegiatan Rutin</h2>
          <div className="row g-3">
            {rutin.map((a) => (
              <div className="col-md-4" key={a.id}>
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">{a.title}</h5>
                    <p className="card-text text-muted mb-1">
                      <i className="bi bi-person me-1"></i>{a.speaker}
                    </p>
                    <p className="card-text text-muted">
                      <i className="bi bi-clock me-1"></i>{a.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Galeri */}
        <section className="mb-5">
          <h2 className="section-title h4 mb-3">Galeri Kegiatan</h2>
          <div className="row g-3">
            {db.gallery.map((g) => (
              <div className="col-6 col-md-3" key={g.id}>
                <img src={g.image} alt={g.caption} className="gallery-img" />
                <div className="small text-muted mt-1">{g.caption}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Kontak + saran */}
        <section className="mb-5">
          <div className="row g-4">
            <div className="col-md-6">
              <h2 className="section-title h4 mb-3">Kontak Pengurus</h2>
              <ul className="list-group">
                {db.officers.map((o) => (
                  <li className="list-group-item d-flex justify-content-between align-items-center" key={o.id}>
                    <span>
                      <strong>{o.name}</strong>
                      <span className="text-muted ms-2">{o.role}</span>
                    </span>
                    <a href={`https://wa.me/${o.phone}`} target="_blank" rel="noreferrer" className="btn btn-sm wa-btn">
                      <i className="bi bi-whatsapp me-1"></i>WhatsApp
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-md-6">
              <h2 className="section-title h4 mb-3">Usulan / Kritik Warga</h2>
              <SuggestionForm onSaved={() => setDb(getDB())} />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer-landing py-4 mt-4">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-6">
              <h5 className="text-white">{s.nama}</h5>
              <p className="mb-1"><i className="bi bi-geo-alt me-2"></i>{s.alamat}</p>
              <p className="small opacity-75 mb-0">© {new Date().getFullYear()} DKM {s.nama}</p>
            </div>
            <div className="col-md-6">
              <iframe
                title="lokasi"
                src={s.mapsEmbed}
                width="100%"
                height="180"
                style={{ border: 0, borderRadius: 10 }}
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

function SuggestionForm({ onSaved }) {
  const [form, setForm] = useState({ name: '', message: '' });
  const [sent, setSent] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    update((db) => {
      db.suggestions.unshift({ id: uid(), ...form, at: new Date().toISOString() });
    });
    setSent(true);
    setForm({ name: '', message: '' });
    onSaved();
  };

  if (sent) {
    return (
      <div className="alert alert-success">
        Terima kasih, usulan Anda sudah terkirim ke pengurus.
        <button className="btn btn-sm btn-link" onClick={() => setSent(false)}>Kirim lagi</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card border-0 shadow-sm p-3">
      <input
        className="form-control mb-2"
        placeholder="Nama (boleh anonim)"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <textarea
        className="form-control mb-2"
        rows="3"
        placeholder="Tulis usulan atau kritik…"
        required
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
      ></textarea>
      <button className="btn btn-hijau">Kirim</button>
    </form>
  );
}

export default Home;
