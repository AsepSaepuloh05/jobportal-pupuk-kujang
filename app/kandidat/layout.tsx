import KandidatShell from "../components/KandidatShell";

export default function KandidatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <KandidatShell>{children}</KandidatShell>;
}