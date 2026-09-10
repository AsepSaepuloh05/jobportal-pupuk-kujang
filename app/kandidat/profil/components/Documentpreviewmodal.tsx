"use client";

import { Download, FileWarning, X } from "lucide-react";
import { isImageFile, isPdfFile, formatUkuran } from "../utils";

export interface PreviewTarget {
  namaAsli: string;
  pathFile: string;
  tipeFile: string;
  ukuranFile: number;
}

export function DocumentPreviewModal({
  doc,
  onClose,
}: {
  doc: PreviewTarget;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-[3px]">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.18)]">
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">
              {doc.namaAsli}
            </p>

            <p className="mt-0.5 text-xs text-slate-400">
              {formatUkuran(doc.ukuranFile)}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <a
              href={doc.pathFile}
              download={doc.namaAsli}
              target="_blank"
              rel="noopener noreferrer"
              title="Unduh"
              className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <Download className="h-4 w-4" />
            </a>

            <button
              type="button"
              onClick={onClose}
              title="Tutup"
              className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-slate-100">
          {isImageFile(doc.tipeFile) ? (
            <div className="flex min-h-[300px] items-center justify-center p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={doc.pathFile}
                alt={doc.namaAsli}
                className="max-h-[70vh] w-auto rounded-lg object-contain shadow-sm"
              />
            </div>
          ) : isPdfFile(doc.tipeFile) ? (
            <iframe
              src={doc.pathFile}
              title={doc.namaAsli}
              className="h-[75vh] w-full"
            />
          ) : (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-200">
                <FileWarning className="h-6 w-6" />
              </div>

              <p className="text-sm font-medium text-slate-600">
                Pratinjau tidak tersedia untuk tipe file ini.
              </p>

              <a
                href={doc.pathFile}
                download={doc.namaAsli}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-600"
              >
                <Download className="h-3.5 w-3.5" />
                Unduh File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}