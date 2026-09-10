"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "../../css/daftarkandidat.css";

interface Kandidat {
  id: number;
  nama: string;
  email: string;
  nik: string;
  role: string;
  createdAt: string;
}

export default function KandidatPage() {
  const router = useRouter();

  const [kandidat, setKandidat] = useState<Kandidat[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const getKandidat = async () => {
      try {
        const response = await fetch("/api/daftarkandidat");

        if (!response.ok) {
          throw new Error("Gagal mengambil data kandidat");
        }

        const data = await response.json();

        setKandidat(data);
      } catch (error) {
        console.error("GET KANDIDAT ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    getKandidat();
  }, []);

  const filteredKandidat = kandidat.filter((item) => {
    const keyword = search.toLowerCase();

    return (
      item.nama.toLowerCase().includes(keyword) ||
      item.email.toLowerCase().includes(keyword) ||
      item.nik.toLowerCase().includes(keyword)
    );
  });

  return (
    <div className="kandidat-page">

      {/* HEADER */}
      <div className="kandidat-header">

        <div>
          <h1>Data Kandidat</h1>

          <p>
            Kelola dan lihat seluruh kandidat yang
            terdaftar di JobPortal.
          </p>
        </div>

        <div className="kandidat-total">

          <span>👥</span>

          <div>
            <strong>{kandidat.length}</strong>
            <small>Total Kandidat</small>
          </div>

        </div>

      </div>

      {/* CONTENT */}
      <div className="kandidat-panel">

        {/* PANEL HEADER */}
        <div className="kandidat-panel-header">

          <div>
            <h2>Daftar Kandidat</h2>

            <p>
              Kandidat yang memiliki akun dengan role
              KANDIDAT.
            </p>
          </div>

          {/* SEARCH */}
          <div className="kandidat-search">

            <span>🔍</span>

            <input
              type="text"
              placeholder="Cari nama, email, atau NIK..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

          </div>

        </div>

        {/* TABLE */}
        {loading ? (
          <div className="kandidat-loading">
            Memuat data kandidat...
          </div>
        ) : filteredKandidat.length === 0 ? (
          <div className="kandidat-empty">

            <div>👥</div>

            <h3>
              {search
                ? "Kandidat tidak ditemukan"
                : "Belum ada kandidat"}
            </h3>

            <p>
              {search
                ? "Coba gunakan kata kunci pencarian yang lain."
                : "Belum terdapat user dengan role KANDIDAT."}
            </p>

          </div>
        ) : (
          <div className="kandidat-table-wrapper">

            <table className="kandidat-table">

              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Kandidat</th>
                  <th>Email</th>
                  <th>NIK</th>
                  <th>Role</th>
                  <th>Tanggal Daftar</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>

                {filteredKandidat.map((item, index) => (

                  <tr key={item.id}>

                    <td>
                      {index + 1}
                    </td>

                    <td>

                      <div className="candidate-name">

                        <div className="candidate-avatar">
                          {item.nama
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {item.nama}
                          </strong>

                          <span>
                            ID Kandidat #{item.id}
                          </span>
                        </div>

                      </div>

                    </td>

                    <td>
                      {item.email}
                    </td>

                    <td>
                      {item.nik}
                    </td>

                    <td>

                      <span className="role-badge">
                        {item.role}
                      </span>

                    </td>

                    <td>
                      {new Date(
                        item.createdAt
                      ).toLocaleDateString(
                        "id-ID",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </td>

                    <td>

                      <button
                        className="detail-button"
                        onClick={() =>
                          router.push(
                            `/hr/kandidat/${item.id}`
                          )
                        }
                      >
                        Detail
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}