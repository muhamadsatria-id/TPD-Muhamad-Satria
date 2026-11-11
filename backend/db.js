const mysql = require('mysql2/promise');

const pengaturan = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

const NAMA_DATABASE = process.env.DB_NAME || 'db_siswa';

let poolKoneksi; // diisi oleh siapkan() di bawah

// Menyiapkan database + tabel dibuat otomatis.
// lalu membuka pool koneksi, saat server mulai.
async function siapkan() {
  // 1) Sambung ke MySQL, lalu buat database-nya kalau belum ada.
  const sementara = await mysql.createConnection(pengaturan);
  await sementara.query(
    `CREATE DATABASE IF NOT EXISTS \`${NAMA_DATABASE}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await sementara.end();

  poolKoneksi = mysql.createPool({
    ...pengaturan,
    database: NAMA_DATABASE,
    dateStrings: true, // tanggal dikirim sebagai teks "YYYY-MM-DD"
    connectionLimit: 10,
  });

  // 2) Buat tabel "Data Siswa" jika belum ada.
  await poolKoneksi.query(`
    CREATE TABLE IF NOT EXISTS \`Data Siswa\` (
      id                   INT AUTO_INCREMENT PRIMARY KEY,
      kode_siswa           VARCHAR(30)  NOT NULL UNIQUE,
      nama_siswa           VARCHAR(100) NOT NULL,
      alamat_siswa         TEXT NULL,
      tanggal_lahir_siswa  DATE NULL,
      jurusan_siswa        VARCHAR(100) NOT NULL,
      created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) CHARACTER SET utf8mb4
  `);
}

// Menjalankan perintah SQL lewat pool koneksi.
function jalankan(sql, nilai) {
  return poolKoneksi.query(sql, nilai);
}

module.exports = { siapkan, jalankan };
