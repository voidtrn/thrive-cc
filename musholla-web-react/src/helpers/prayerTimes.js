// Jadwal sholat: mode 'auto' tarik dari API Aladhan (method 20 = KEMENAG RI),
// mode 'manual' pakai jam yang diinput pengurus di CMS.
export async function getPrayerTimes(config) {
  if (config.mode === 'manual') {
    return { ...config.manual, source: 'manual' };
  }
  try {
    const res = await fetch(
      `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(config.city)}&country=Indonesia&method=20`
    );
    const json = await res.json();
    const t = json.data.timings;
    return {
      subuh: t.Fajr,
      dzuhur: t.Dhuhr,
      ashar: t.Asr,
      maghrib: t.Maghrib,
      isya: t.Isha,
      imsak: t.Imsak,
      source: 'auto',
    };
  } catch {
    return { ...config.manual, source: 'manual (API gagal)' };
  }
}

// Cari waktu sholat berikutnya untuk di-highlight
export function nextPrayerName(times) {
  const order = ['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'];
  const now = new Date().toTimeString().slice(0, 5);
  return order.find((p) => times[p] && times[p] > now) || 'subuh';
}
