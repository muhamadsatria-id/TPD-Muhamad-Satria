// Mengubah "2008-05-10" menjadi "10/05/2008".
function rapikanTanggal(teks) {
  return teks ? teks.split('-').reverse().join('/') : '-';
}

export default function TabelSiswa({ daftar, saatUbah, saatHapus }) {
  return (
    <div className="tabel-bungkus">
      <table>
        <thead>
          <tr>
            <th>Kode Siswa (NIS)</th>
            <th>Nama Siswa</th>
            <th>Alamat Siswa</th>
            <th>Tanggal Lahir</th>
            <th>Jurusan</th>
            <th className="kolom-aksi">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {daftar.map((siswa) => (
            <tr key={siswa.id}>
              <td className="kode">{siswa.kode_siswa}</td>
              <td>{siswa.nama_siswa}</td>
              <td className="alamat">{siswa.alamat_siswa || '-'}</td>
              <td>{rapikanTanggal(siswa.tanggal_lahir_siswa)}</td>
              <td>{siswa.jurusan_siswa}</td>
              <td className="aksi">
                <button className="tombol kecil" onClick={() => saatUbah(siswa)}>Ubah</button>
                <button className="tombol kecil bahaya" onClick={() => saatHapus(siswa)}>Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
