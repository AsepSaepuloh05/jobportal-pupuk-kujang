import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Profil Saya",
};

export default function JudulLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}