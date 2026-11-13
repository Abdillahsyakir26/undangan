import Link from 'next/link';
export default function NotFound() {
  return (
    <main className="paper min-h-dvh flex flex-col items-center justify-center text-center px-6 gap-5">
      <img src="/orn/gunungan.webp" alt="" className="w-28 opacity-90" />
      <p className="font-script text-6xl gold-text">404</p>
      <h1 className="font-serif text-2xl">Halaman tidak ditemukan</h1>
      <p className="text-ink/70 max-w-sm">Tautan undangan yang Anda buka tidak tersedia. Silakan periksa kembali tautan dari pengundang.</p>
      <Link href="/" className="btn-gold">Kembali ke beranda</Link>
    </main>
  );
}
