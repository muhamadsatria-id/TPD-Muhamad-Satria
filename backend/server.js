const express = require('express');
const cors = require('cors');
const basisdata = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());          // izinkan frontend (port 5173) memanggil API ini
app.use(express.json());  // baca body request berbentuk JSON

// Mengambil isi form dari user dan memeriksa kelengkapannya.
// Hasilnya { isi } kalau lengkap, atau { pesan } kalau ada yang salah.
function periksa(body) {
  const isi = {
    nis: String(body.nis ?? '').trim(),
    nama: String(body.nama ?? '').trim(),
    alamat: String(body.alamat ?? '').trim() || null,
    tanggal_lahir: String(body.tanggal_lahir ?? '').trim() || null,
    jurusan: String(body.jurusan ?? '').trim(),
  };

  if (!isi.nis) return { pesan: 'Kode siswa (NIS) wajib diisi.' };
  if (!isi.nama) return { pesan: 'Nama siswa wajib diisi.' };
  if (!isi.jurusan) return { pesan: 'Jurusan siswa wajib diisi.' };
  return { isi };
}

// Mengubah error MySQL menjadi balasan yang mudah dibaca user.
function errorDatabase(err, res) {
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'Kode siswa (NIS) sudah terdaftar.' });
  }
  console.error(err);
  return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
}

// Mengambil satu siswa dari database berdasarkan id.
async function cariSiswa(id) {
  const [baris] = await basisdata.jalankan('SELECT * FROM `Data Siswa` WHERE id = ?', [id]);
  return baris[0];
}

// BACA: semua siswa, bisa dicari dengan /api/siswa?q=kata
app.get('/api/siswa', async (req, res) => {
  try {
    const cari = String(req.query.q ?? '').trim();

    let sql = 'SELECT * FROM `Data Siswa`';
    const nilai = [];

    if (cari) {
      sql += ' WHERE nama LIKE ? OR nis LIKE ? OR jurusan LIKE ?';
      nilai.push(`%${cari}%`, `%${cari}%`, `%${cari}%`);
    }

    sql += ' ORDER BY nama';

    const [daftar] = await basisdata.jalankan(sql, nilai);
    res.json(daftar);
  } catch (err) {
    errorDatabase(err, res);
  }
});

// BACA: satu siswa berdasarkan id
app.get('/api/siswa/:id', async (req, res) => {
  try {
    const siswa = await cariSiswa(req.params.id);
    if (!siswa) return res.status(404).json({ message: 'Siswa tidak ditemukan.' });
    res.json(siswa);
  } catch (err) {
    errorDatabase(err, res);
  }
});

// TAMBAH: siswa baru
app.post('/api/siswa', async (req, res) => {
  const { isi, pesan } = periksa(req.body);
  if (pesan) return res.status(400).json({ message: pesan });

  try {
    const [info] = await basisdata.jalankan('INSERT INTO `Data Siswa` SET ?', [isi]);
    res.status(201).json(await cariSiswa(info.insertId));
  } catch (err) {
    errorDatabase(err, res);
  }
});

// UBAH: siswa berdasarkan id
app.put('/api/siswa/:id', async (req, res) => {
  const { isi, pesan } = periksa(req.body);
  if (pesan) return res.status(400).json({ message: pesan });

  try {
    const siswaLama = await cariSiswa(req.params.id);
    if (!siswaLama) return res.status(404).json({ message: 'Siswa tidak ditemukan.' });

    await basisdata.jalankan('UPDATE `Data Siswa` SET ? WHERE id = ?', [isi, req.params.id]);
    res.json(await cariSiswa(req.params.id));
  } catch (err) {
    errorDatabase(err, res);
  }
});

// HAPUS: siswa berdasarkan id
app.delete('/api/siswa/:id', async (req, res) => {
  try {
    const [info] = await basisdata.jalankan('DELETE FROM `Data Siswa` WHERE id = ?', [req.params.id]);
    if (info.affectedRows === 0) {
      return res.status(404).json({ message: 'Siswa tidak ditemukan.' });
    }
    res.status(204).end();
  } catch (err) {
    errorDatabase(err, res);
  }
});

// Server baru mulai setelah database siap.
basisdata.siapkan()
  .then(() => {
    app.listen(PORT, () => console.log(`API berjalan di http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Gagal terhubung ke MySQL:', err.message);
    console.error('Pastikan MySQL sudah menyala dan pengaturan di backend/db.js sudah benar.');
    process.exit(1);
  });
