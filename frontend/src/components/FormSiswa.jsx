import { useState } from 'react';

export default function FormSiswa({ siswa, onKirim, onTutup }) {
  const baru = !siswa.id; // true = tambah data baru, false = ubah data lama
  const [isi, setIsi] = useState({
    id: siswa.id,
    nis: siswa.nis ?? '',
    nama: siswa.nama ?? '',
    alamat: siswa.alamat ?? '',
    tanggal_lahir: siswa.tanggal_lahir ?? '',
    jurusan: siswa.jurusan ?? '',
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
            <input name="nis" value={isi.nis} onChange={perbarui} required autoFocus />
          </label>
          <label>
            <span>Nama Siswa</span>
            <input name="nama" value={isi.nama} onChange={perbarui} required />
          </label>
          <label className="span-2">
            <span>Alamat Siswa</span>
            <textarea name="alamat" rows="2" value={isi.alamat} onChange={perbarui} />
          </label>
          <label>
            <span>Tanggal Lahir Siswa</span>
            <input name="tanggal_lahir" type="date" value={isi.tanggal_lahir} onChange={perbarui} />
          </label>
          <label>
            <span>Jurusan Siswa</span>
            <input name="jurusan" value={isi.jurusan} onChange={perbarui} placeholder="Contoh: IPA / RPL" required />
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
