const mysql = require('mysql2/promise');

// Pengaturan koneksi MySQL (default XAMPP/Laragon: user root, tanpa password).
// Bisa juga lewat environment variable: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME.
const pengaturan = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

const NAMA_DATABASE = process.env.DB_NAME || 'db_siswa';

let poolKoneksi; // diisi oleh siapkan() di bawah

// Menyiapkan database + tabel (dibuat otomatis bila belum ada),
// lalu membuka pool koneksi. Cukup dijalankan sekali saat server mulai.
async function siapkan() {
  // 1) Sambung ke MySQL, lalu buat database-nya kalau belum ada.
  const sementara = await mysql.createConnection(pengaturan);
  await sementara.query(
    `CREATE DATABASE IF NOT EXISTS \`${NAMA_DATABASE}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await sementara.end();

  // 2) Buka pool koneksi (kumpulan koneksi siap pakai) ke database tersebut.
  poolKoneksi = mysql.createPool({
    ...pengaturan,
    database: NAMA_DATABASE,
    dateStrings: true, // tanggal dikirim sebagai teks "YYYY-MM-DD"
    connectionLimit: 10,
  });

  // 3) Buat tabel "Data Siswa" kalau belum ada.
  await poolKoneksi.query(`
    CREATE TABLE IF NOT EXISTS \`Data Siswa\` (
      id             INT AUTO_INCREMENT PRIMARY KEY,
      nis            VARCHAR(30)  NOT NULL UNIQUE,
      nama           VARCHAR(100) NOT NULL,
      alamat         TEXT NULL,
      tanggal_lahir  DATE NULL,
      jurusan        VARCHAR(100) NOT NULL,
      created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) CHARACTER SET utf8mb4
  `);
}

// Menjalankan perintah SQL lewat pool koneksi.
function jalankan(sql, nilai) {
  return poolKoneksi.query(sql, nilai);
}

module.exports = { siapkan, jalankan };
