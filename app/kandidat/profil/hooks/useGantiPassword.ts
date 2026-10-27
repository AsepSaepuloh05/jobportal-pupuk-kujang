"use client";

import { useState } from "react";

import { validatePassword } from "@/lib/password";
import { toast } from "../components/Toast";

export const initialPasswordForm = {
  passwordLama: "",
  passwordBaru: "",
  konfirmasiPassword: "",
};

export type PasswordForm = typeof initialPasswordForm;

export function useGantiPassword() {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    ...initialPasswordForm,
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const openPasswordModal = () => {
    setPasswordForm({ ...initialPasswordForm });
    setPasswordError(null);
    setShowPasswordModal(true);
  };

  const closePasswordModal = () => {
    if (savingPassword) return;
    setShowPasswordModal(false);
    setPasswordForm({ ...initialPasswordForm });
    setPasswordError(null);
  };

  const savePassword = async () => {
    const { passwordLama, passwordBaru, konfirmasiPassword } = passwordForm;

    if (!passwordLama || !passwordBaru || !konfirmasiPassword) {
      setPasswordError("Semua field wajib diisi.");
      return;
    }

    const strengthError = validatePassword(passwordBaru);

    if (strengthError) {
      setPasswordError(strengthError);
      return;
    }

    if (passwordBaru !== konfirmasiPassword) {
      setPasswordError("Konfirmasi password tidak cocok.");
      return;
    }

    if (passwordBaru === passwordLama) {
      setPasswordError("Password baru tidak boleh sama dengan password lama.");
      return;
    }

    setSavingPassword(true);
    setPasswordError(null);

    try {
      const res = await fetch("/api/profil/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordForm),
        cache: "no-store",
      });

      let data;

      try {
        data = await res.json();
      } catch {
        setPasswordError("Response dari server tidak valid.");
        return;
      }

      if (!res.ok || !data.success) {
        setPasswordError(data.message || "Gagal mengubah password.");
        return;
      }

      setShowPasswordModal(false);
      setPasswordForm({ ...initialPasswordForm });

      toast.success("Password berhasil diubah.");
    } catch (error) {
      console.error("CHANGE PASSWORD ERROR:", error);
      setPasswordError("Terjadi kesalahan saat mengubah password.");
    } finally {
      setSavingPassword(false);
    }
  };

  return {
    showPasswordModal,
    passwordForm,
    setPasswordForm,
    savingPassword,
    passwordError,
    openPasswordModal,
    closePasswordModal,
    savePassword,
  };
}