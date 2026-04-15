# Kuiper Safety Blog — Next.js Frontend

Öffentlicher Blog unter **blog.kuiper-safety.de**. Liest aus PocketBase (`pb.kuiper-safety.de`), renders server-side, ISR 5 Min.

## Entwicklung
```bash
npm install
npm run dev   # localhost:3200
```

## Deploy
Via Coolify — Dockerfile-Build, Port 3200.

## Struktur
- `src/app/page.tsx` — Homepage (Artikel-Liste)
- `src/app/[category]/page.tsx` — Kategorie-Seiten
- `src/app/[category]/[slug]/page.tsx` — Artikel-Detail mit JSON-LD
- `src/app/sitemap.ts` — dynamische Sitemap
- `src/lib/pb.ts` — PocketBase Client + Types
