import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Daftar Akun",
};

export default function JudulLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}