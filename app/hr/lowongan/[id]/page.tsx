"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import "../../../css/hr-lowongan.css";

type StatusLowongan = "AKTIF" | "DRAFT" | "DITUTUP";

interface Lowongan {
    id: number;
    posisi: string;
    departemen: string;
    lokasi: string;
    tipe: string;
    status: StatusLowongan;
    pelamar: number;
    deskripsi: string | null;
    persyaratan: string | null;
    gaji: string | null;
    tanggalBerakhir: string | null;
    createdAt: string;
    updatedAt: string;
}

const statusLabel: Record<StatusLowongan, string> = {
    AKTIF: "Aktif",
    DRAFT: "Draft",
    DITUTUP: "Ditutup",
};

export default function DetailLowonganPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [lowongan, setLowongan] = useState<Lowongan | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const getLowongan = async () => {
            try {
                const response = await fetch(`/api/lowongan/${id}`);

                if (response.status === 404) {
                    setNotFound(true);
                    return;
                }

                if (!response.ok) {
                    throw new Error("Gagal mengambil data lowongan");
                }

                const data = await response.json();

                setLowongan(data);
            } catch (error) {
                console.error("GET LOWONGAN DETAIL ERROR:", error);
                alert("Gagal mengambil data lowongan");
            } finally {
                setLoading(false);
            }
        };

        getLowongan();
    }, [id]);

    if (loading) {
        return (
            <div className="hr-loading">
                Memuat detail lowongan...
            </div>
        );
    }

    if (notFound || !lowongan) {
        return (
            <>
                <header className="hr-header">
                    <div>
                        <h1>Lowongan Tidak Ditemukan</h1>
                        <p>Lowongan yang kamu cari mungkin sudah dihapus.</p>
                    </div>
                </header>

                <button
                    className="lowongan-detail-back"
                    style={{ marginTop: 20 }}
                    onClick={() => router.push("/hr/kelolalowongan")}
                >
                    ← Kembali ke Daftar Lowongan
                </button>
            </>
        );
    }

    const persyaratanList = lowongan.persyaratan
        ? lowongan.persyaratan
            .split("\n")
            .map((item) => item.trim())
            .filter((item) => item.length > 0)
        : [];

    const isExpired =
        lowongan.tanggalBerakhir &&
        new Date(lowongan.tanggalBerakhir) < new Date() &&
        lowongan.status === "AKTIF";

    return (
        <>
            <header className="hr-header">
                <div>
                    <h1>Detail Lowongan</h1>
                    <p>Informasi lengkap mengenai lowongan ini.</p>
                </div>
            </header>

            <div className="lowongan-top">
                <div />
            </div>

            <div className="lowongan-detail-panel">

                <div className="lowongan-detail-header">

                    <div className="lowongan-detail-icon">
                        {lowongan.posisi.substring(0, 2).toUpperCase()}
                    </div>

                    <div>
                        <h2>{lowongan.posisi}</h2>
                        <p>{lowongan.departemen}</p>

                        {isExpired && (
                            <div className="lowongan-expired-warning">
                                ⚠️ Sudah melewati batas tapi masih Aktif
                            </div>
                        )}
                    </div>

                </div>

                <div className="lowongan-detail-body">

                    <div className="lowongan-detail-item">
                        <span>Lokasi</span>
                        <strong>📍 {lowongan.lokasi}</strong>
                    </div>

                    <div className="lowongan-detail-item">
                        <span>Tipe Pekerjaan</span>
                        <strong>{lowongan.tipe}</strong>
                    </div>

                    <div className="lowongan-detail-item">
                        <span>Status</span>
                        <strong>{statusLabel[lowongan.status]}</strong>
                    </div>

                    <div className="lowongan-detail-item">
                        <span>Jumlah Pelamar</span>
                        <strong>{lowongan.pelamar}</strong>
                    </div>

                    <div className="lowongan-detail-item">
                        <span>Gaji</span>
                        <strong>{lowongan.gaji || "-"}</strong>
                    </div>

                    <div className="lowongan-detail-item">
                        <span>Batas Lowongan Ditutup</span>
                        <strong>
                            {lowongan.tanggalBerakhir
                                ? new Date(lowongan.tanggalBerakhir).toLocaleDateString(
                                    "id-ID",
                                    { day: "2-digit", month: "long", year: "numeric" }
                                )
                                : "-"}
                        </strong>
                    </div>

                    <div className="lowongan-detail-item">
                        <span>Dibuat</span>
                        <strong>
                            {new Date(lowongan.createdAt).toLocaleDateString(
                                "id-ID",
                                { day: "2-digit", month: "long", year: "numeric" }
                            )}
                        </strong>
                    </div>

                    <div className="lowongan-detail-item">
                        <span>Terakhir Diubah</span>
                        <strong>
                            {new Date(lowongan.updatedAt).toLocaleDateString(
                                "id-ID",
                                { day: "2-digit", month: "long", year: "numeric" }
                            )}
                        </strong>
                    </div>

                </div>

                {lowongan.deskripsi && (
                    <div className="lowongan-detail-section">
                        <h3>Deskripsi Pekerjaan</h3>
                        <p>{lowongan.deskripsi}</p>
                    </div>
                )}

                {persyaratanList.length > 0 && (
                    <div className="lowongan-detail-section">
                        <h3>Persyaratan / Kualifikasi</h3>
                        <ul className="lowongan-detail-list">
                            {persyaratanList.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="lowongan-detail-footer">

                    <button
                        className="lowongan-detail-edit"
                        onClick={() =>
                            router.push(`/hr/lowongan/${lowongan.id}/edit`)
                        }
                    >
                        ✏️ Edit Lowongan
                    </button>

                    <button
                        className="lowongan-detail-back"
                        onClick={() => router.push("/hr/kelolalowongan")}
                    >
                        ← Kembali
                    </button>

                </div>

            </div>
        </>
    );
}