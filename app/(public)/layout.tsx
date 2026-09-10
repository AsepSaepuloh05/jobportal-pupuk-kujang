import Navbar from "../components/navbar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f7faf8]">

      <Navbar />

      <main>
        {children}
      </main>

    </div>
  );
}