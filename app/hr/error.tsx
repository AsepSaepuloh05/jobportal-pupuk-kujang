"use client";

import { useEffect } from "react";
import ErrorState from "@/app/components/ErrorState";

interface ErrorPageProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function HRError({ error, reset }: ErrorPageProps) {
    useEffect(() => {
        console.error("HR PAGE ERROR:", error);
    }, [error]);

    return (
        <ErrorState
            onRetry={reset}
            homeHref="/hr"
            homeLabel="Ke Dashboard"
        />
    );
}