import { useState } from 'react';

export default function FormSiswa({ siswa, onKirim, onTutup }) {
  const baru = !siswa.id; // true = tambah data baru, false = ubah data lama
  const [isi, setIsi] = useState({
    id: siswa.id,
    kode_siswa: siswa.kode_siswa ?? '',
    nama_siswa: siswa.nama_siswa ?? '',
    alamat_siswa: siswa.alamat_siswa ?? '',
    tanggal_lahir_siswa: siswa.tanggal_lahir_siswa ?? '',
    jurusan_siswa: siswa.jurusan_siswa ?? '',
  });
  const [pesan, setPesan] = useState('');
  const [sedangSimpan, setSedangSimpan] = useState(false);

  // Dipakai semua input: menyimpan nilai sesuai atribut name-nya.
  function perbarui(e) {
    setIsi({ ...isi, [e.target.name]: e.target.value });
  }

  // Saat tombol Simpan ditekan.
  async function kirimForm(e) {
    e.preventDefault();
    setPesan('');
    setSedangSimpan(true);
    try {
      await onKirim(isi);
    } catch (err) {
      setPesan(err.message);
      setSedangSimpan(false);
    }
  }

  return (
    <div className="latar" onMouseDown={(e) => e.target === e.currentTarget && onTutup()}>
      <form className="modal" onSubmit={kirimForm}>
        <div className="modal-head">
          <h2>{baru ? 'Tambah Data Siswa' : 'Ubah Data Siswa'}</h2>
          <button type="button" className="tutup" onClick={onTutup} aria-label="Tutup">×</button>
        </div>

        <div className="grid-form">
          <label>
            <span>Kode Siswa (NIS)</span>
            <input name="kode_siswa" value={isi.kode_siswa} onChange={perbarui} required autoFocus />
          </label>
          <label>
            <span>Nama Siswa</span>
            <input name="nama_siswa" value={isi.nama_siswa} onChange={perbarui} required />
          </label>
          <label className="span-2">
            <span>Alamat Siswa</span>
            <textarea name="alamat_siswa" rows="2" value={isi.alamat_siswa} onChange={perbarui} />
          </label>
          <label>
            <span>Tanggal Lahir Siswa</span>
            <input name="tanggal_lahir_siswa" type="date" value={isi.tanggal_lahir_siswa} onChange={perbarui} />
          </label>
          <label>
            <span>Jurusan Siswa</span>
            <input name="jurusan_siswa" value={isi.jurusan_siswa} onChange={perbarui} placeholder="Contoh: IPA / RPL" required />
          </label>
        </div>

        {pesan && <div className="galat" role="alert">{pesan}</div>}

        <div className="tombol-form">
          <button type="button" className="tombol" onClick={onTutup}>Batal</button>
          <button type="submit" className="tombol utama" disabled={sedangSimpan}>
            {sedangSimpan ? 'Menyimpan…' : 'Simpan'}
          </button>
        </div>
      </form>
    </div>
  );
}
