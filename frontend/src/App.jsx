import { useEffect, useState } from 'react';
import { apiSiswa } from './api';
import FormSiswa from './components/FormSiswa';
import TabelSiswa from './components/TabelSiswa';

export default function App() {
  const [daftar, setDaftar] = useState([]);         // semua data siswa dari server
  const [cari, setCari] = useState('');             // isi kolom pencarian
  const [memuat, setMemuat] = useState(true);       // true saat data belum sempat diambil
  const [gagal, setGagal] = useState('');            // pesan error
  const [notifikasi, setNotifikasi] = useState(''); // pesan singkat di bawah layar
  const [form, setForm] = useState(null);           // data untuk form (null = form tertutup)

  // Mengambil data siswa dari server.
  async function ambilData(kata = cari) {
    try {
      setGagal('');
      setDaftar(await apiSiswa.ambil(kata));
    } catch (e) {
      setGagal('Gagal memuat data. Pastikan server backend sudah berjalan.');
    } finally {
      setMemuat(false);
    }
  }

  // Ambil data saat halaman dibuka dan tiap kata pencarian berubah.
  // Dijeda 250 ms supaya server tidak dipanggil tiap huruf diketik.
  useEffect(() => {
    const jeda = setTimeout(() => ambilData(cari), 250);
    return () => clearTimeout(jeda);
  }, [cari]);

  // Sembunyikan notifikasi otomatis setelah 2,5 detik.
  useEffect(() => {
    if (!notifikasi) return;
    const jeda = setTimeout(() => setNotifikasi(''), 2500);
    return () => clearTimeout(jeda);
  }, [notifikasi]);

  // Dipanggil FormSiswa saat tombol Simpan ditekan.
  async function simpanData(isi) {
    if (isi.id) {
      await apiSiswa.ubah(isi.id, isi);
      setNotifikasi('Data siswa disimpan.');
    } else {
      await apiSiswa.tambah(isi);
      setNotifikasi('Siswa ditambahkan.');
    }
    setForm(null); // tutup form
    ambilData();   // perbarui tabel
  }

  // Dipanggil TabelSiswa saat tombol Hapus ditekan.
  async function hapusData(siswa) {
    if (!window.confirm(`Hapus data ${siswa.nama_siswa}? Tindakan ini tidak bisa dibatalkan.`)) return;
    try {
      await apiSiswa.hapus(siswa.id);
      setNotifikasi('Siswa dihapus.');
      ambilData();
    } catch (e) {
      setGagal(e.message);
    }
  }

  return (
    <div className="halaman">
      <header className="kepala">
        <div>
          <p className="tag">Muhamad Satria - belajar node js &amp; react</p>
          <h1>Data Siswa</h1>
        </div>
        <div className="kepala-aksi">
          <button className="tombol utama" onClick={() => setForm({})}>
            + Tambah
          </button>
        </div>
      </header>

      <div className="toolbar">
        <input
          className="cari"
          type="search"
          placeholder="Cari kode, nama, atau jurusan..."
          value={cari}
          onChange={(e) => setCari(e.target.value)}
          aria-label="Cari siswa"
        />
        <div className="stat">{daftar.length} data</div>
      </div>

      {gagal && <div className="galat" role="alert">{gagal}</div>}

      {memuat ? (
        <p className="kosong">Memuat data…</p>
      ) : daftar.length === 0 ? (
        <div className="kosong">
          {cari ? 'Tidak ada data yang cocok.' : 'Belum ada data. Klik “+ Tambah” untuk mulai.'}
        </div>
      ) : (
        <TabelSiswa daftar={daftar} saatUbah={setForm} saatHapus={hapusData} />
      )}

      {form && <FormSiswa siswa={form} onKirim={simpanData} onTutup={() => setForm(null)} />}

      {notifikasi && <div className="toast" role="status">{notifikasi}</div>}
    </div>
  );
}
