import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Data Kandidat",
};

export default function JudulLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}