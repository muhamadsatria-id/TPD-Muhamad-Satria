// Alat bantu untuk memanggil API di backend.

async function panggil(url, pilihan = {}) {
  const hasil = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...pilihan,
  });

  const balasan = hasil.status === 204 ? null : await hasil.json();

  if (!hasil.ok) {
    throw new Error(balasan?.message || 'Terjadi kesalahan.');
  }
  return balasan;
}

// Semua panggilan API untuk data siswa.
export const apiSiswa = {
  ambil: (cari = '') => panggil(`/api/siswa?q=${encodeURIComponent(cari)}`),
  tambah: (isi) => panggil('/api/siswa', { method: 'POST', body: JSON.stringify(isi) }),
  ubah: (id, isi) => panggil(`/api/siswa/${id}`, { method: 'PUT', body: JSON.stringify(isi) }),
  hapus: (id) => panggil(`/api/siswa/${id}`, { method: 'DELETE' }),
};
