import Link from "next/link";

export default function NotFound() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#f6faf8] px-6">
            <div className="w-full max-w-md text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
                    <img
                        src="/Logo_kujang.jpg"
                        alt="Logo Pupuk Kujang"
                        className="h-full w-full object-cover"
                    />
                </div>

                <p className="mt-6 text-7xl font-black tracking-tight text-emerald-600">
                    404
                </p>

                <h1 className="mt-3 text-xl font-bold text-slate-900">
                    Halaman tidak ditemukan
                </h1>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                    Halaman yang kamu cari tidak ada, sudah dipindahkan, atau
                    alamatnya salah ketik.
                </p>

                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link
                        href="/"
                        className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                        Ke Beranda
                    </Link>

                    <Link
                        href="/login"
                        className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                        Masuk
                    </Link>
                </div>

            </div>
        </main>
    );
}