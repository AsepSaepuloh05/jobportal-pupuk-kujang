import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Edit Lowongan",
};

export default function JudulLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}