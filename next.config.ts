import type { NextConfig } from "next";

const securityHeaders = [
  // Mencegah browser menebak MIME type secara sembarangan
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // Mencegah serangan clickjacking (SAMEORIGIN mengizinkan iframe preview berkas dari domain sendiri)
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  // Mengontrol informasi asal saat berpindah halaman
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // Nonaktifkan fitur hardware yang tidak digunakan portal karir
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
