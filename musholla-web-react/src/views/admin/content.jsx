import React, { useState } from 'react';
import { getDB, update, uid } from '../../helpers/store';
import { currentUser } from '../../helpers/auth';

const TABS = ['Pengumuman', 'Galeri', 'Jadwal Sholat', 'Profil Mushola'];

function Content() {
  const [tab, setTab] = useState(TABS[0]);
  const [db, setDb] = useState(getDB());
  const user = currentUser();
  const refresh = () => setDb(getDB());
  const save = (mutator, action) => {
    update(mutator, action, user.name);
    refresh();
  };

  return (
    <>
      <h3 className="fw-bold mb-3">Konten Landing Page</h3>
      <ul className="nav nav-tabs mb-3">
        {TABS.map((t) => (
          <li className="nav-item" key={t}>
            <button className={`nav-link ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
          </li>
        ))}
      </ul>

      {tab === 'Pengumuman' && <Announcements db={db} save={save} />}
      {tab === 'Galeri' && <Gallery db={db} save={save} />}
      {tab === 'Jadwal Sholat' && <PrayerSettings db={db} save={save} />}
      {tab === 'Profil Mushola' && <Profile db={db} save={save} />}
    </>
  );
}

function Announcements({ db, save }) {
  const [form, setForm] = useState({ text: '', expiredAt: '' });

  const add = (e) => {
    e.preventDefault();
    save((d) => d.announcements.unshift({ id: uid(), ...form }), `Tambah pengumuman: ${form.text.slice(0, 40)}`);
    setForm({ text: '', expiredAt: '' });
  };

  const remove = (id) => save((d) => { d.announcements = d.announcements.filter((a) => a.id !== id); }, 'Hapus pengumuman');

  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <form onSubmit={add} className="card border-0 shadow-sm p-3 mb-3">
        <div className="row g-2">
          <div className="col-md-7">
            <input className="form-control" placeholder="Isi pengumuman / running text" required
              value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
          </div>
          <div className="col-md-3">
            <input className="form-control" type="date" title="Tanggal expired" required
              value={form.expiredAt} onChange={(e) => setForm({ ...form, expiredAt: e.target.value })} />
          </div>
          <div className="col-md-2">
            <button className="btn btn-hijau w-100">Tambah</button>
          </div>
        </div>
        <div className="form-text">Pengumuman otomatis hilang dari landing page setelah tanggal expired.</div>
      </form>
      <ul className="list-group">
        {db.announcements.map((a) => (
          <li className="list-group-item d-flex justify-content-between align-items-center" key={a.id}>
            <span>
              {a.text}
              <span className={`badge ms-2 ${a.expiredAt >= today ? 'bg-success' : 'bg-secondary'}`}>
                {a.expiredAt >= today ? `aktif s/d ${a.expiredAt}` : 'expired'}
              </span>
            </span>
            <button className="btn btn-sm btn-outline-danger" onClick={() => remove(a.id)}>Hapus</button>
          </li>
        ))}
      </ul>
    </>
  );
}

function Gallery({ db, save }) {
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState('');

  const onFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const add = (e) => {
    e.preventDefault();
    if (!image) return;
    save((d) => d.gallery.unshift({ id: uid(), image, caption }), `Upload foto galeri: ${caption}`);
    setCaption(''); setImage('');
  };

  const remove = (id) => save((d) => { d.gallery = d.gallery.filter((g) => g.id !== id); }, 'Hapus foto galeri');

  return (
    <>
      <form onSubmit={add} className="card border-0 shadow-sm p-3 mb-3">
        <div className="row g-2 align-items-center">
          <div className="col-md-4"><input className="form-control" type="file" accept="image/*" onChange={onFile} /></div>
          <div className="col-md-5">
            <input className="form-control" placeholder="Caption foto" required
              value={caption} onChange={(e) => setCaption(e.target.value)} />
          </div>
          <div className="col-md-3"><button className="btn btn-hijau w-100">Upload</button></div>
        </div>
        {image && <img src={image} alt="preview" className="mt-2" style={{ maxHeight: 120, borderRadius: 8 }} />}
      </form>
      <div className="row g-3">
        {db.gallery.map((g) => (
          <div className="col-6 col-md-3" key={g.id}>
            <div className="card border-0 shadow-sm">
              <img src={g.image} alt={g.caption} className="gallery-img card-img-top" />
              <div className="card-body p-2 d-flex justify-content-between align-items-center">
                <span className="small">{g.caption}</span>
                <button className="btn btn-sm btn-outline-danger" onClick={() => remove(g.id)}>
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function PrayerSettings({ db, save }) {
  const [cfg, setCfg] = useState(db.prayerConfig);

  const submit = (e) => {
    e.preventDefault();
    save((d) => { d.prayerConfig = cfg; }, `Update jadwal sholat (mode ${cfg.mode})`);
  };

  return (
    <form onSubmit={submit} className="card border-0 shadow-sm p-3" style={{ maxWidth: 560 }}>
      <div className="mb-3">
        <label className="form-label fw-bold">Mode Jadwal</label>
        <select className="form-select" value={cfg.mode} onChange={(e) => setCfg({ ...cfg, mode: e.target.value })}>
          <option value="auto">Otomatis (API Aladhan — KEMENAG)</option>
          <option value="manual">Manual (input sendiri)</option>
        </select>
      </div>
      {cfg.mode === 'auto' ? (
        <div className="mb-3">
          <label className="form-label">Kota</label>
          <input className="form-control" value={cfg.city} onChange={(e) => setCfg({ ...cfg, city: e.target.value })} />
        </div>
      ) : (
        <div className="row g-2 mb-3">
          {Object.keys(cfg.manual).map((p) => (
            <div className="col-4" key={p}>
              <label className="form-label text-capitalize">{p}</label>
              <input className="form-control" type="time" value={cfg.manual[p]}
                onChange={(e) => setCfg({ ...cfg, manual: { ...cfg.manual, [p]: e.target.value } })} />
            </div>
          ))}
        </div>
      )}
      <button className="btn btn-hijau">Simpan</button>
    </form>
  );
}

function Profile({ db, save }) {
  const [s, setS] = useState(db.settings);

  const onPhoto = (field) => (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setS({ ...s, [field]: reader.result });
    reader.readAsDataURL(file);
  };

  const submit = (e) => {
    e.preventDefault();
    save((d) => { d.settings = s; }, 'Update profil mushola');
  };

  return (
    <form onSubmit={submit} className="card border-0 shadow-sm p-3" style={{ maxWidth: 640 }}>
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Nama Mushola</label>
          <input className="form-control" value={s.nama} onChange={(e) => setS({ ...s, nama: e.target.value })} />
        </div>
        <div className="col-md-6">
          <label className="form-label">Tagline</label>
          <input className="form-control" value={s.tagline} onChange={(e) => setS({ ...s, tagline: e.target.value })} />
        </div>
        <div className="col-12">
          <label className="form-label">Alamat Lengkap</label>
          <textarea className="form-control" rows="2" value={s.alamat} onChange={(e) => setS({ ...s, alamat: e.target.value })}></textarea>
        </div>
        <div className="col-12">
          <label className="form-label">Google Maps Embed URL</label>
          <input className="form-control" value={s.mapsEmbed} onChange={(e) => setS({ ...s, mapsEmbed: e.target.value })} />
        </div>
        <div className="col-md-6">
          <label className="form-label">Foto Mushola</label>
          <input className="form-control" type="file" accept="image/*" onChange={onPhoto('foto')} />
          {s.foto && <img src={s.foto} alt="foto" className="mt-2" style={{ maxHeight: 100, borderRadius: 8 }} />}
        </div>
        <div className="col-md-6">
          <label className="form-label">Banner</label>
          <input className="form-control" type="file" accept="image/*" onChange={onPhoto('banner')} />
          {s.banner && <img src={s.banner} alt="banner" className="mt-2" style={{ maxHeight: 100, borderRadius: 8 }} />}
        </div>
      </div>
      <div className="mt-3">
        <button className="btn btn-hijau">Simpan Profil</button>
      </div>
    </form>
  );
}

export default Content;
