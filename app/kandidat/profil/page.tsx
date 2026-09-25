"use client";

import { documents } from "./types";
import { useProfilKandidat } from "./hooks/useProfilKandidat";

import { ProfileHero } from "./components/ProfileHero";
import { PengalamanSection } from "./components/PengalamanSection";
import { PendidikanSection } from "./components/PendidikanSection";
import { SertifikasiSection } from "./components/SertifikasiSection";
import { DocumentsSection } from "./components/DocumentsSection";
import { EditProfileModal } from "./components/EditProfileModal";
import { DocumentPreviewModal } from "./components/Documentpreviewmodal";

export default function ProfilKandidatPage() {
  const p = useProfilKandidat();

  if (p.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6faf8]">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
          </div>

          <p className="text-sm font-medium text-slate-500">
            Memuat profil...
          </p>
        </div>
      </div>
    );
  }

  if (!p.user) return null;

  const displayFoto =
    p.fotoPreview ||
    p.user.dokumenProfil?.pathFile ||
    null;

  return (
    <div className="min-h-screen bg-[#f6faf8] text-slate-900">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <ProfileHero
          user={p.user}
          displayFoto={displayFoto}
          uploadingFoto={p.uploadingFoto}
          fotoInputRef={p.fotoInputRef}
          onFotoChange={p.handleFotoChange}
          onEditProfile={() => p.setEditingProfile(true)}
        />

        <div className="mt-6 grid grid-cols-1 gap-5">
          <PengalamanSection
            items={p.pengalaman}
            showModal={p.showPengalamanModal}
            editingId={p.editingPengalamanId}
            form={p.pengalamanForm}
            setForm={p.setPengalamanForm}
            saving={p.savingPengalaman}
            onOpenTambah={p.openTambahPengalaman}
            onOpenEdit={p.openEditPengalaman}
            onClose={() =>
              p.setShowPengalamanModal(false)
            }
            onSave={p.savePengalaman}
            onDelete={p.deletePengalaman}
          />

          <PendidikanSection
            items={p.pendidikan}
            showModal={p.showPendidikanModal}
            editingId={p.editingPendidikanId}
            form={p.pendidikanForm}
            setForm={p.setPendidikanForm}
            saving={p.savingPendidikan}
            ijazahFile={p.ijazahFile}
            uploadingIjazah={p.uploadingIjazah}
            onIjazahFileChange={
              p.handleIjazahFileChange
            }
            onClearIjazahFile={
              p.clearIjazahFile
            }
            onDeleteIjazah={p.deleteIjazah}
            onOpenTambah={p.openTambahPendidikan}
            onOpenEdit={p.openEditPendidikan}
            onClose={() =>
              p.setShowPendidikanModal(false)
            }
            onSave={p.savePendidikan}
            onDelete={p.deletePendidikan}
          />

          <SertifikasiSection
            items={p.sertifikasi}
            showModal={p.showSertifikasiModal}
            editingId={p.editingSertifikasiId}
            form={p.sertifikasiForm}
            setForm={p.setSertifikasiForm}
            saving={p.savingSertifikasi}
            onOpenTambah={p.openTambahSertifikasi}
            onOpenEdit={p.openEditSertifikasi}
            onClose={() =>
              p.setShowSertifikasiModal(false)
            }
            onSave={p.saveSertifikasi}
            onDelete={p.deleteSertifikasi}
          />

          <DocumentsSection
            documents={documents}
            uploadedDocs={p.uploadedDocs}
            uploading={p.uploading}
            fileInputRefs={p.fileInputRefs}
            onUpload={p.handleUpload}
            onDelete={p.handleDeleteDocument}
            onPreview={p.openPreview}
          />
        </div>
      </main>

      {p.previewDoc && (
        <DocumentPreviewModal
          doc={p.previewDoc}
          onClose={p.closePreview}
        />
      )}

      {p.editingProfile && (
        <EditProfileModal
          form={p.profileForm}
          setForm={p.setProfileForm}
          saving={p.savingProfile}
          onClose={() => p.setEditingProfile(false)}
          onSave={p.saveProfile}
        />
      )}
    </div>
  );
}