'use client';
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="paper min-h-dvh flex flex-col items-center justify-center text-center px-6 gap-4">
      <h1 className="font-serif text-3xl">Terjadi kesalahan</h1>
      <p className="text-ink/70">Maaf, halaman gagal dimuat. Silakan coba lagi.</p>
      <button className="btn-gold" onClick={reset}>Muat ulang</button>
    </main>
  );
}
