"use client";

import {
  BadgeCheck,
  Camera,
  CreditCard,
  Mail,
  MapPin,
  Pencil,
  User,
} from "lucide-react";
import { UserData } from "../types";

export function ProfileHero({
  user,
  displayFoto,
  uploadingFoto,
  fotoInputRef,
  onFotoChange,
  onEditProfile,
}: {
  user: UserData;
  displayFoto: string | null;
  uploadingFoto: boolean;
  fotoInputRef: React.RefObject<HTMLInputElement | null>;
  onFotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEditProfile: () => void;
}) {
  const initial = user.nama?.charAt(0).toUpperCase() || "K";

  return (
    <section className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.04)]">
      <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400" />

      <div className="px-5 pb-7 pt-6 sm:px-8 sm:pt-7">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <User className="h-4 w-4" />
              </div>

              <span className="text-sm font-semibold text-slate-800">
                Profil Kandidat
              </span>
            </div>

            <p className="mt-2 text-xs text-slate-400">
              Kelola informasi pribadi dan data profesional Anda.
            </p>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

            <span className="text-[11px] font-semibold text-emerald-700">
              Profil Aktif
            </span>
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {/* FOTO */}
            <div className="relative h-28 w-28 shrink-0">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-[22px] bg-gradient-to-br from-emerald-100 to-teal-100 text-4xl font-bold text-emerald-600 ring-1 ring-slate-200">
                {displayFoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={displayFoto}
                    alt={user.nama}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initial
                )}
              </div>

              {uploadingFoto && (
                <div className="absolute inset-0 flex items-center justify-center rounded-[22px] bg-slate-950/50">
                  <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                </div>
              )}

              <button
                type="button"
                onClick={() => fotoInputRef.current?.click()}
                disabled={uploadingFoto}
                title="Ganti foto profil"
                className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-xl border-2 border-white bg-slate-900 text-white shadow-lg transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Camera className="h-4 w-4" />
              </button>

              <input
                ref={fotoInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                hidden
                onChange={onFotoChange}
              />
            </div>

            {/* IDENTITY */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-[28px]">
                  {user.nama}
                </h1>

                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Kandidat
                </span>
              </div>

              <div className="mt-3 flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-2">
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  {user.email}
                </span>

                <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />

                <span className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-slate-400" />
                  NIK {user.nik}
                </span>

                <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />

                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  {user.alamat || "Domisili belum diisi"}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onEditProfile}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 sm:w-auto"
          >
            <Pencil className="h-4 w-4" />
            Edit Profil
          </button>
        </div>
      </div>
    </section>
  );
}