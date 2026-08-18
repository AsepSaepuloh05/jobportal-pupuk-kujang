"use client";

import { FormEvent, useEffect, useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const getUsers = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/users");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Gagal mengambil data user"
        );
      }

      setUsers(data);
    } catch (error) {
      console.error(error);
      alert("Gagal mengambil data user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!name.trim() || !email.trim()) {
      alert("Nama dan email wajib diisi");
      return;
    }

    try {
      setSaving(true);

      const url =
        editingId === null
          ? "/api/users"
          : `/api/users/${editingId}`;

      const method =
        editingId === null
          ? "POST"
          : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Gagal menyimpan data"
        );
      }

      resetForm();

      await getUsers();
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Terjadi kesalahan");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setName(user.name);
    setEmail(user.email);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm(
      "Apakah kamu yakin ingin menghapus user ini?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `/api/users/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Gagal menghapus user"
        );
      }

      await getUsers();
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Gagal menghapus user");
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setEmail("");
  };

  const filteredUsers = users.filter((user) => {
    const keyword = search.toLowerCase();

    return (
      user.name.toLowerCase().includes(keyword) ||
      user.email.toLowerCase().includes(keyword)
    );
  });

  return (
    <main className="users-page">

      {/* HEADER */}

      <header className="page-header">
        <div>
          <p className="eyebrow">USER MANAGEMENT</p>

          <h1>Data User</h1>

          <p className="subtitle">
            Kelola data pengguna aplikasi dengan mudah.
          </p>
        </div>

        <div className="header-icon">
          👥
        </div>
      </header>

      {/* STATISTIC */}

      <section className="stats-grid">

        <div className="stat-card">
          <div>
            <p>Total User</p>
            <h2>{users.length}</h2>
          </div>

          <div className="stat-icon blue">
            👤
          </div>
        </div>

        <div className="stat-card">
          <div>
            <p>Data Ditampilkan</p>
            <h2>{filteredUsers.length}</h2>
          </div>

          <div className="stat-icon green">
            📊
          </div>
        </div>

      </section>

      {/* FORM */}

      <section className="content-card">

        <div className="card-title">

          <div>
            <h2>
              {editingId === null
                ? "Tambah User"
                : "Edit User"}
            </h2>

            <p>
              {editingId === null
                ? "Tambahkan pengguna baru ke sistem."
                : "Perbarui informasi pengguna."}
            </p>
          </div>

          {editingId !== null && (
            <button
              type="button"
              className="cancel-top"
              onClick={resetForm}
            >
              Batal Edit
            </button>
          )}

        </div>

        <form
          className="user-form"
          onSubmit={handleSubmit}
        >

          <div className="input-group">

            <label>Nama Lengkap</label>

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Contoh: Asep Saepuloh"
            />

          </div>

          <div className="input-group">

            <label>Email</label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="Contoh: asep@gmail.com"
            />

          </div>

          <button
            type="submit"
            className="primary-button"
            disabled={saving}
          >
            {saving
              ? "Menyimpan..."
              : editingId === null
              ? "+ Tambah User"
              : "✓ Simpan Perubahan"}
          </button>

        </form>

      </section>

      {/* TABLE */}

      <section className="content-card">

        <div className="table-header">

          <div>
            <h2>Daftar User</h2>

            <p>
              {users.length} pengguna terdaftar
            </p>
          </div>

          <div className="search-box">

            <span>🔍</span>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Cari user..."
            />

          </div>

        </div>

        {loading ? (

          <div className="empty-state">
            <div className="loading-circle"></div>
            <p>Memuat data user...</p>
          </div>

        ) : filteredUsers.length === 0 ? (

          <div className="empty-state">

            <div className="empty-icon">
              👤
            </div>

            <h3>
              {search
                ? "User tidak ditemukan"
                : "Belum ada user"}
            </h3>

            <p>
              {search
                ? "Coba gunakan kata pencarian lain."
                : "Tambahkan user pertama kamu menggunakan form di atas."}
            </p>

          </div>

        ) : (

          <div className="table-container">

            <table>

              <thead>

                <tr>
                  <th>ID</th>
                  <th>USER</th>
                  <th>EMAIL</th>
                  <th>TERDAFTAR</th>
                  <th>AKSI</th>
                </tr>

              </thead>

              <tbody>

                {filteredUsers.map((user) => (

                  <tr key={user.id}>

                    <td>
                      <span className="id-badge">
                        #{user.id}
                      </span>
                    </td>

                    <td>

                      <div className="user-info">

                        <div className="avatar">
                          {user.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {user.name}
                          </strong>

                          <small>
                            User
                          </small>
                        </div>

                      </div>

                    </td>

                    <td>
                      <span className="email">
                        {user.email}
                      </span>
                    </td>

                    <td>
                      {new Date(
                        user.createdAt
                      ).toLocaleDateString(
                        "id-ID",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </td>

                    <td>

                      <div className="action-buttons">

                        <button
                          className="edit-button"
                          onClick={() =>
                            handleEdit(user)
                          }
                        >
                          ✏️ Edit
                        </button>

                        <button
                          className="delete-button"
                          onClick={() =>
                            handleDelete(user.id)
                          }
                        >
                          🗑 Hapus
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>

      <footer className="page-footer">
        CRUD User • Next.js + Prisma + PostgreSQL
      </footer>

    </main>
  );
}