"use client";

import { useEffect, useState } from "react";
import { FileText, Image as ImageIcon } from "lucide-react";

/* ============================================================
   HELPER & KOMPONEN PRATINJAU FILE
   Dipakai bersama oleh bagian dokumen (ijazah, sertifikat, dll)
============================================================ */

export type FileKind = "pdf" | "image" | "file";

export function formatFileSize(bytes?: number | null) {
  if (!bytes) return "";

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFileKind(
  type?: string | null,
  name?: string | null
): FileKind {
  const mime = (type || "").toLowerCase();
  const fileName = (name || "").toLowerCase();

  if (mime === "application/pdf" || fileName.endsWith(".pdf")) {
    return "pdf";
  }

  if (
    mime.startsWith("image/") ||
    /\.(jpe?g|png)$/.test(fileName)
  ) {
    return "image";
  }

  return "file";
}

export function getKindLabel(kind: FileKind) {
  if (kind === "pdf") return "PDF";
  if (kind === "image") return "Gambar";
  return "File";
}

/* ============================================================
   THUMBNAIL FILE
   Gambar tampil sebagai pratinjau, PDF tampil sebagai ikon
============================================================ */

export function FileThumb({
  kind,
  src,
  size = "md",
}: {
  kind: FileKind;
  src?: string | null;
  size?: "md" | "lg";
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const box = size === "lg" ? "h-16 w-16" : "h-12 w-12";

  if (kind === "image" && src && !failed) {
    return (
      <div
        className={`${box} shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200`}
      >
        <img
          src={src}
          alt="Pratinjau dokumen"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  if (kind === "pdf") {
    return (
      <div
        className={`${box} flex shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl bg-red-50 text-red-600 ring-1 ring-red-100`}
      >
        <FileText className="h-5 w-5" />

        <span className="text-[9px] font-black tracking-wide">
          PDF
        </span>
      </div>
    );
  }

  return (
    <div
      className={`${box} flex shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 ring-1 ring-slate-200`}
    >
      {kind === "image" ? (
        <ImageIcon className="h-5 w-5" />
      ) : (
        <FileText className="h-5 w-5" />
      )}
    </div>
  );
}

/* ============================================================
   PRATINJAU FILE BARU (SEBELUM DIUNGGAH)
============================================================ */

export function NewFileThumb({ file }: { file: File }) {
  const kind = getFileKind(file.type, file.name);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (kind !== "image") {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);

    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file, kind]);

  return <FileThumb kind={kind} src={previewUrl} size="lg" />;
}