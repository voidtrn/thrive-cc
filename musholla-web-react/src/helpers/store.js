// localStorage-backed data store. Ganti implementasi get/save dengan API call
// ke backend sungguhan tanpa perlu mengubah komponen (interface tetap sama).
const KEY = 'musholla_db_v1';

const seed = {
  settings: {
    nama: 'Musholla Al-Ikhlas',
    tagline: 'Memakmurkan masjid, merajut ukhuwah',
    alamat: 'Jl. Melati No. 12, RT 03/RW 05, Kel. Sukamaju, Jakarta Timur',
    mapsEmbed: 'https://www.google.com/maps?q=-6.2,106.85&output=embed',
    foto: '',
    banner: '',
    kasTotal: 12750000,
    imsak: '04:28',
  },
  announcements: [
    { id: 'a1', text: 'Kajian rutin Ustadz H. Mahmud setiap Rabu ba’da Maghrib', expiredAt: '2099-01-01' },
    { id: 'a2', text: 'Kerja bakti bersih-bersih mushola Ahad pagi pukul 07.00', expiredAt: '2099-01-01' },
  ],
  gallery: [
    { id: 'g1', image: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=600', caption: 'Sholat Idul Fitri 1446 H' },
    { id: 'g2', image: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=600', caption: 'Kajian bulanan' },
  ],
  activities: [
    { id: 'k1', title: 'Pengajian Ibu-Ibu', speaker: 'Ustadzah Fatimah', date: '', time: 'Senin 16.00', type: 'rutin' },
    { id: 'k2', title: 'Belajar Ngaji Anak (TPA)', speaker: 'Kak Ridwan', date: '', time: 'Senin–Jumat 16.30', type: 'rutin' },
    { id: 'k3', title: 'Kajian Tafsir', speaker: 'Ustadz H. Mahmud', date: '2026-07-08', time: '18.30', type: 'kajian' },
  ],
  khatibList: [
    { id: 'j1', name: 'Ustadz H. Mahmud', origin: 'DKM Al-Ikhlas', phone: '6281234567890', date: nextFriday(0), imam: 'H. Salim' },
    { id: 'j2', name: 'Ustadz Dr. Arif', origin: 'MUI Kecamatan', phone: '6281298765432', date: nextFriday(1), imam: 'H. Salim' },
  ],
  inventory: [
    { id: 'i1', name: 'Karpet sajadah roll', qty: 6, condition: 'Baik', history: [] },
    { id: 'i2', name: 'Sound system + 2 speaker', qty: 1, condition: 'Baik', history: [{ date: '2026-03-10', note: 'Ganti kabel mic' }] },
    { id: 'i3', name: 'Kipas angin dinding', qty: 4, condition: '1 rusak ringan', history: [] },
    { id: 'i4', name: 'Al-Quran', qty: 30, condition: 'Baik', history: [] },
  ],
  aidRequests: [],
  suggestions: [],
  officers: [
    { id: 'o1', name: 'H. Salim', role: 'Ketua DKM', phone: '6281200000001', photo: '' },
    { id: 'o2', name: 'Budi Santoso', role: 'Bendahara', phone: '6281200000002', photo: '' },
    { id: 'o3', name: 'Ahmad (Marbot)', role: 'Marbot', phone: '6281200000003', photo: '' },
  ],
  users: [
    { username: 'admin', password: 'admin123', role: 'admin', name: 'H. Salim' },
    { username: 'bendahara', password: 'bendahara123', role: 'bendahara', name: 'Budi Santoso' },
    { username: 'marbot', password: 'marbot123', role: 'marbot', name: 'Ahmad' },
  ],
  logs: [],
  prayerConfig: {
    mode: 'auto',
    city: import.meta.env.VITE_PRAYER_CITY || 'Jakarta',
    manual: { subuh: '04:38', dzuhur: '11:58', ashar: '15:20', maghrib: '17:52', isya: '19:05' },
  },
};

function nextFriday(weeksAhead) {
  const d = new Date();
  d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7 || 7) + weeksAhead * 7);
  return d.toISOString().slice(0, 10);
}

export function getDB() {
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    localStorage.setItem(KEY, JSON.stringify(seed));
    return JSON.parse(JSON.stringify(seed));
  }
  return JSON.parse(raw);
}

export function saveDB(db) {
  localStorage.setItem(KEY, JSON.stringify(db));
}

// Mutasi + catat log aktivitas dalam satu transaksi
export function update(mutator, logAction, userName) {
  const db = getDB();
  mutator(db);
  if (logAction) {
    db.logs.unshift({ id: uid(), user: userName || 'system', action: logAction, at: new Date().toISOString() });
    db.logs = db.logs.slice(0, 100);
  }
  saveDB(db);
  return db;
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export const rupiah = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

export const activeAnnouncements = (db) =>
  db.announcements.filter((a) => !a.expiredAt || a.expiredAt >= new Date().toISOString().slice(0, 10));

export const nextJumat = (db) => {
  const today = new Date().toISOString().slice(0, 10);
  return [...db.khatibList].filter((k) => k.date >= today).sort((a, b) => a.date.localeCompare(b.date))[0] || null;
};
