import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Kelola Lowongan",
};

export default function JudulLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}