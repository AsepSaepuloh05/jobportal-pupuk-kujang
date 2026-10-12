import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Lowongan Pekerjaan",
};

export default function JudulLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}