# Undangan Pernikahan Online — Abdillah & Zanila

Next.js 14 · Tailwind · Framer Motion · libSQL/Turso (SQLite) · Lucide · sharp

## Jalankan lokal (tanpa akun apa pun)
```bash
cp .env.example .env     # isi ADMIN_PASSWORD & AUTH_SECRET
npm install
npm run build && npm start     # http://localhost:3000
```
- Undangan: `/undangan?to=Nama%20Tamu`   - Admin: `/admin`
- Lokal memakai file `data/undangan.db` (foto & lagu unggahan juga tersimpan di database ini).

## Online GRATIS: Turso + Vercel
1. **Turso** (turso.tech) → daftar → buat database. Salin *Database URL* (`libsql://...`)
   dan buat *Auth Token*. (Atau CLI: `turso db create undangan`, `turso db show undangan --url`,
   `turso db tokens create undangan`.)
2. Upload project ke **GitHub**.
3. **Vercel** (vercel.com) → *Add New Project* → pilih repo → isi Environment Variables:
   `ADMIN_PASSWORD`, `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`
   → Deploy. Tabel dibuat otomatis saat pertama dibuka.
4. Buka `https://<project>.vercel.app/admin`, isi data, Simpan.
5. (Opsional) Pasang domain sendiri di Vercel → Settings → Domains, lalu ubah `NEXT_PUBLIC_SITE_URL` & Redeploy.

Catatan batas gratis: foto otomatis dikompres; lagu unggahan maks. 4 MB (lagu bawaan
`public/audio/lagu.mp3` ikut project, tidak memakai kuota database). Cek batas paket
Turso/Vercel terbaru di situs masing-masing.
Rate-limit spam disimpan di memori server, jadi di Vercel (serverless) sifatnya "sebisanya";
honeypot, validasi, dan batas waktu isi form tetap aktif.

## Struktur
`components/` UI & animasi · `components/admin/` dashboard · `app/api/` endpoint ·
`lib/` db, validasi, keamanan · `public/orn/` ornamen WebP transparan · `tools/` skrip pemotong ornamen
