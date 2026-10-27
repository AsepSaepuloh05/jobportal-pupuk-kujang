import KandidatShell from "../components/KandidatShell";
import { Toaster } from "@/app/kandidat/profil/components/Toast";
import { ConfirmDialog } from "@/app/kandidat/profil/components/ConfirmDialog";

export default function KandidatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <KandidatShell>
      {children}

      {/* Notifikasi toast dan dialog konfirmasi untuk semua halaman kandidat */}
      <Toaster />
      <ConfirmDialog />
    </KandidatShell>
  );
}