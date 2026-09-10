"use client";

import { Check, Eye, FileText, Trash2, Upload } from "lucide-react";
import { DokumenConfig, UploadedDokumen } from "../types";
import { formatUkuran } from "../utils";
import { ModernSection } from "./Shared";
import { PreviewTarget } from "./Documentpreviewmodal";

export function DocumentsSection({
  documents,
  uploadedDocs,
  uploading,
  fileInputRefs,
  onUpload,
  onDelete,
  onPreview,
}: {
  documents: DokumenConfig[];
  uploadedDocs: Record<string, UploadedDokumen>;
  uploading: Record<string, boolean>;
  fileInputRefs: React.MutableRefObject<
    Record<string, HTMLInputElement | null>
  >;
  onUpload: (key: string, file: File) => void;
  onDelete: (key: string) => void;
  onPreview: (doc: PreviewTarget) => void;
}) {
  return (
    <ModernSection
      icon={<FileText className="h-5 w-5" />}
      iconStyle="emerald"
      title="Dokumen Pendukung"
      description="Dokumen yang digunakan dalam proses rekrutmen."
    >
      <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {documents.map((doc) => {
          const uploaded = uploadedDocs[doc.key];
          const isUploading = uploading[doc.key];

          return (
            <div
              key={doc.key}
              className="group rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition hover:border-slate-300 hover:bg-white hover:shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    uploaded
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-white text-slate-400 ring-1 ring-slate-200"
                  }`}
                >
                  <FileText className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800">
                        {doc.label}
                      </p>

                      {uploaded ? (
                        <div className="mt-1.5 flex min-w-0 items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />

                          <p className="truncate text-xs font-medium text-emerald-700">
                            {uploaded.namaAsli}
                          </p>
                        </div>
                      ) : (
                        <p className="mt-1 text-xs text-slate-400">
                          {doc.description}
                        </p>
                      )}
                    </div>

                    {uploaded && (
                      <div className="flex shrink-0 items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => onPreview(uploaded)}
                          className="rounded-lg p-1.5 text-slate-300 transition hover:bg-emerald-50 hover:text-emerald-600"
                          title="Lihat dokumen"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDelete(doc.key)}
                          className="rounded-lg p-1.5 text-slate-300 transition hover:bg-red-50 hover:text-red-500"
                          title="Hapus dokumen"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {uploaded && (
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        {formatUkuran(uploaded.ukuranFile)}
                      </span>

                      <button
                        type="button"
                        disabled={isUploading}
                        onClick={() =>
                          fileInputRefs.current[doc.key]?.click()
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isUploading ? (
                          <>
                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            Mengunggah
                          </>
                        ) : (
                          <>
                            <Upload className="h-3 w-3" />
                            Ganti
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {!uploaded && (
                    <div className="mt-3">
                      <button
                        type="button"
                        disabled={isUploading}
                        onClick={() =>
                          fileInputRefs.current[doc.key]?.click()
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isUploading ? (
                          <>
                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            Mengunggah
                          </>
                        ) : (
                          <>
                            <Upload className="h-3 w-3" />
                            Upload Dokumen
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <input
                ref={(el) => {
                  fileInputRefs.current[doc.key] = el;
                }}
                type="file"
                accept={doc.accept}
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];

                  e.target.value = "";

                  if (file) {
                    onUpload(doc.key, file);
                  }
                }}
              />
            </div>
          );
        })}
      </div>
    </ModernSection>
  );
}