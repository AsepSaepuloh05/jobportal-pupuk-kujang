import SidebarKandidat from "../components/sidebarkandidat";

export default function KandidatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-slate-50">

      {/* SIDEBAR */}
      <SidebarKandidat />

      {/* CONTENT */}
      <section className="ml-[250px] min-h-screen">
        {children}
      </section>

    </main>
  );
}