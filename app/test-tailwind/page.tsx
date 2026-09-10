export default function TestTailwind() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-green-50">
      <div className="rounded-2xl bg-white p-10 shadow-lg">
        <h1 className="text-4xl font-bold text-green-700">
          Tailwind Berhasil!
        </h1>

        <p className="mt-3 text-gray-600">
          Tailwind CSS sudah aktif di project Next.js saya.
        </p>
      </div>
    </main>
  );
}