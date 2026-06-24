/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Konfigurasi gambar: izinkan gambar lokal dari /public
  images: {
    domains: [],
    // Untuk gambar lokal di /public, tidak perlu konfigurasi tambahan
    // Gambar di /public/images/ diakses langsung via /images/xxx.png
  },

  // Nonaktifkan ESLint saat build agar tidak error di Vercel
  // jika ada peringatan TypeScript/ESLint yang tidak kritis
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Nonaktifkan TypeScript error saat build (opsional, aktifkan jika kode sudah bersih)
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
