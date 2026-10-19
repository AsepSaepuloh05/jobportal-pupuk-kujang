// Letakkan di: lib/password.ts
// Aturan password tunggal, dipakai di register, API, dan ganti password.

export const PASSWORD_MIN_LENGTH = 8;

export type PasswordRule = {
  id: string;
  label: string;
  test: (value: string) => boolean;
  message: string;
};

export const PASSWORD_RULES: PasswordRule[] = [
  {
    id: "length",
    label: `Minimal ${PASSWORD_MIN_LENGTH} karakter`,
    test: (v) => v.length >= PASSWORD_MIN_LENGTH,
    message: `Password minimal ${PASSWORD_MIN_LENGTH} karakter`,
  },
  {
    id: "upper",
    label: "Minimal 1 huruf besar (A-Z)",
    test: (v) => /[A-Z]/.test(v),
    message: "Password harus mengandung minimal 1 huruf besar",
  },
  {
    id: "lower",
    label: "Minimal 1 huruf kecil (a-z)",
    test: (v) => /[a-z]/.test(v),
    message: "Password harus mengandung minimal 1 huruf kecil",
  },
  {
    id: "number",
    label: "Minimal 1 angka (0-9)",
    test: (v) => /\d/.test(v),
    message: "Password harus mengandung minimal 1 angka",
  },
  {
    id: "special",
    label: "Minimal 1 karakter unik (contoh: ! @ # $ % &)",
    test: (v) => /[^A-Za-z0-9\s]/.test(v),
    message: "Password harus mengandung minimal 1 karakter unik (contoh: ! @ # $ %)",
  },
  {
    id: "space",
    label: "Tidak mengandung spasi",
    test: (v) => !/\s/.test(v),
    message: "Password tidak boleh mengandung spasi",
  },
];

/** Mengembalikan pesan error pertama, atau null jika password valid. */
export function validatePassword(value: string): string | null {
  for (const rule of PASSWORD_RULES) {
    if (!rule.test(value)) return rule.message;
  }
  return null;
}