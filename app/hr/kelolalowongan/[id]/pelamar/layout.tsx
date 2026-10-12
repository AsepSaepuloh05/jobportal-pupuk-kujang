import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Daftar Pelamar",
};

export default function JudulLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}