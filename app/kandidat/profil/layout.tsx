import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Profil & Dokumen",
};

export default function JudulLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}