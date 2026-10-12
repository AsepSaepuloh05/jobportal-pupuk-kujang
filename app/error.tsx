"use client";

import { useEffect } from "react";
import ErrorState from "@/app/components/ErrorState";

interface ErrorPageProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
    useEffect(() => {
        console.error("APP ERROR:", error);
    }, [error]);

    return (
        <ErrorState
            onRetry={reset}
            homeHref="/"
            homeLabel="Ke Beranda"
            fullScreen
        />
    );
}