---
title: SEO-Migration brandschutzdozenten.de → blog.kuiper-safety.de — Master-Plan
sprint: seo-migration-2026-05
status: Phase 2 LIVE (Soft-Cutover via Canonical + Indexierung aktiv)
created: 2026-05-28
last_updated: 2026-05-28T21:15
critical: Duplicate-Content-Risiko während Übergang — Frühwarnsystem aktiv
---

# SEO-Migration: brandschutzdozenten.de → blog.kuiper-safety.de

## TL;DR

Wir migrieren **8.766 organische Klicks/180T** (43% allein aus Top-5-Pages) von brandschutzdozenten.de auf blog.kuiper-safety.de. Strategie ist **Soft-Migration mit Canonical zuerst, 301-Redirects später**. Phase 2 ist seit 2026-05-28 ~21:00 Uhr live.

## Faktische Lage Stand 2026-05-28

| Was | Status | Wie geschützt |
|---|---|---|
| Inhalts-Duplikate | ~80-85% wortidentisch | Canonical von alt → neu |
| Indexierung neue Domain | seit heute Abend aktiv | robots index/follow |
| Indexierung alte Domain | bleibt aktiv | Canonical-Verweis schützt |
| 301-Redirects | NOCH NICHT (Phase 4) | erst nach 4-8 Wochen Monitoring |
| GSC-Properties | beide siteOwner | Daily-Tracker geplant |

## Duplicate-Content-Strategie

### Warum aktuell kein Penalty droht

1. **Canonical-Tag** auf der alten Domain zeigt eindeutig: „blog.kuiper-safety.de ist Master"
2. **og:url** + **JSON-LD WebPage@id** sind ebenfalls synchronisiert
3. **Identische H1** auf beiden Seiten — Google erkennt das als „bewusste Migration", nicht Spam
4. **Reihenfolge eingehalten:** Canonical wurde zuerst gesetzt, noindex erst danach entfernt — kein Indexierungs-Konflikt
5. **Inhaltliche Erweiterung neu** (mehr Wörter, Layout besser) = Google sieht die neue Seite als verbesserte Version

### Bekannte Risiken

| Risiko | Wahrscheinlichkeit | Mitigation |
|---|---|---|
| Google ignoriert Canonical | ~5% | Daily-GSC-Monitor erkennt Position-Splits sofort |
| Algorithm-Update mitten in Migration | ~10% (irgendwann) | Beide Domains laufen parallel — Rollback möglich |
| Ranking-Wackler 2-4 Wochen | ~40% (normal) | Akzeptiert, ±20% Schwankung erwartet |
| Komplett-Penalty | <1% | Saubere Implementierung minimiert |

### Rollback-Mechanismen

Wenn nach **14 Tagen die Indexierung der neuen URLs nicht startet** oder **Ranking-Drop > 30% in Tier 1**:

1. **Sofort-Rollback Phase 2:**
   - MU-Plugin via FTP löschen: `/brandschutzdozenten.de/wp-content/mu-plugins/ks-canonical-migration.php`
   - blog.kuiper-safety.de wieder auf `noindex` setzen (PR + Deploy)
   - GSC: alte Domain Sitemap forcieren
   - Erwartete Recovery: 1-2 Wochen
2. **Voll-Rollback (worst case):** blog.kuiper-safety.de komplett vom Netz nehmen → reine alte Domain wieder Master

## Migrations-Phasen

### ✅ Phase 1 — Vorbereitung (abgeschlossen)
- Master-URL-Mapping aus 4 Quellen (Sitemap + GSC + WP-REST + Media-API) → 321 URLs
- 31 Tier-1+2-URLs als kritisch identifiziert (≥20 Klicks/180T)
- GSC-Properties für beide Domains verifiziert + siteOwner

### ✅ Phase 2 — Soft-Cutover (LIVE seit 2026-05-28)
- MU-Plugin `ks-canonical-migration.php` auf brandschutzdozenten.de
- Setzt Canonical/OG-URL/Schema auf neue Domain für 31 URLs
- blog.kuiper-safety.de auf `index, follow` umgestellt
- Sitemap in GSC eingereicht
- URL-Inspection für Top-10 angestoßen

### 🔄 Phase 3 — Monitoring (4-8 Wochen) — DRINGEND aufzusetzen
- **Daily-Tracker** für Top-50 URLs auf beiden Properties
- Position, Klicks, Impressions, Canonical-Status, Indexing-Status
- Telegram-Alert bei Drop > 3 Positionen oder Klicks-Drop > 15% w/w
- Dashboard `app.kuiper-safety.de/admin/seo-monitor`

### 🔮 Phase 4 — Hard-Cutover (nach Phase 3 grün)
- `.htaccess` auf brandschutzdozenten.de via KAS-API mit 301-Redirects
- Mapping bereits in `/tmp/migration_master_mapping.json`
- Canonical bleibt bestehen (defense-in-depth)
- Komplett-Übertragung Backlink-Authority

### 🔮 Phase 5 — Authority-Transfer Beschleuniger (optional)
- GSC Change-of-Address (nur bei Option A — alte Domain abschalten)
- Backlink-Outreach Top-20
- Internal Linking überall auf neue Domain

## Blog-Verwaltung — Option 3 KI-Pipeline (geplant)

### Konzept

Vollständig DSGVO-konforme **KI-assistierte Content-Pipeline** auf Basis:
- **CRM-CMS-UI** unter `app.kuiper-safety.de/admin/blog` (Option 2 als Basis)
- **Ollama qwen2.5:32b** auf GEX44 als lokale KI
- **GSC-API** als Datenquelle für SEO-Lücken-Erkennung

### Features

1. **Themen-Vorschläge** — Cron checkt GSC täglich → identifiziert Queries mit hohen Impressions auf Pos 8-20 (=ungenutzte Rank-Chancen) → schlägt Artikel vor
2. **AI-Erstentwurf** — Klick auf „Draft generieren" → Ollama erstellt Artikel-Outline + erste 2-3 Absätze
3. **AI-Konkurrenzanalyse** — analysiert die aktuellen Top-3-rankenden Seiten für die Query → extrahiert Sub-Topics die fehlen
4. **Auto-Internal-Links** — durchsucht blog_articles + blog_internal_links → schlägt 3-5 sinnvolle interne Verlinkungen vor
5. **AI-Featured-Image** — via Replicate (Stable Diffusion) oder Bing Image Creator
6. **Live-SEO-Score** während Editieren (Rank-Math-Logik nachgebaut)
7. **Wochen-Plan** — KI schlägt 3-5 Artikel pro Woche basierend auf SEO-Gap-Analyse vor

### Architektur

```
GSC API ──┐
          ├──→ Ollama qwen2.5:32b ──→ Artikel-Vorschläge
PB Data ──┘                          │
                                     ▼
                              CRM-CMS-UI (TipTap)
                                     │
                                     ▼
                              blog_articles in PB
                                     │
                                     ▼
                          Next.js ISR (5-Min-Revalidate)
                                     │
                                     ▼
                          blog.kuiper-safety.de
```

### Aufbau-Reihenfolge

1. CMS-UI Option 2 — TipTap, PocketBase-Integration
2. SEO-Score Live-Check
3. Themen-Vorschläge aus GSC
4. AI-Draft-Button
5. Auto-Internal-Links
6. Featured-Image-Gen
7. Wochen-Plan-Dashboard

## Monitoring-Setup (Task #12)

### Daily-GSC-Tracker

- Cron 07:00 Uhr (auf GEX44 oder Mainserver-Coolify)
- Pullt für beide Properties: Top-50 URLs Performance (Position, Klicks, Impressions, CTR)
- Speichert in PB-Collection `seo_daily_rankings`
- Vergleicht zu Vortag + Vorwoche
- Telegram-Alert:
  - Position-Drop > 3 auf Tier-1
  - Klicks-Drop > 15% woche/woche
  - Neue URL nicht indexiert nach 14 Tagen
- Dashboard auf `app.kuiper-safety.de/admin/seo-monitor`

### Verifikation aktueller Schutzmaßnahmen

```bash
# Canonical-Check (sollte 31/31 zeigen)
curl -s 'https://brandschutzdozenten.de/blog/<slug>/' | grep -oE '<link rel="canonical" href="[^"]+"'

# Indexing-Status (über GSC API)
python3 /tmp/migration-tools/check-indexing.py  # noch zu bauen

# Position-Tracking aus GSC
python3 /tmp/migration-tools/track-positions.py  # noch zu bauen
```

## Mapping-Quelle

`/tmp/migration_master_mapping.json` — 321 URLs konsolidiert aus:
- brandschutzdozenten.de/sitemap_index.xml (53 Content-URLs)
- GSC 180T-Daten (Top-Performer)
- WP-REST `wp/v2/posts` + `wp/v2/pages` (37+30)
- WP-Media-Library (32 PDFs, 4 mit Traffic)

## TODOs

- [ ] Daily-GSC-Tracker bauen (DRINGEND, Task #12)
- [ ] CMS-UI Option 2 bauen (Bk-Wunsch)
- [ ] KI-Pipeline Option 3 (nach Option 2)
- [ ] 3 Tier-1-PDFs auf blog.kuiper-safety.de übernehmen (Task #11)
- [ ] Homepage-Mapping entscheiden (Task #11)
- [ ] Phase 4 — 301-Hard-Cutover nach 4-8 Wochen Monitoring (Task #13)
- [ ] Blog-Server-Umzug planen (Task #14 — vor Mainserver-Abschaltung)

## PR-Historie

- bk963/kuiper-blog-frontend#3 — Indexierung aktiviert (gemerged 2026-05-28T20:52Z)

## Referenzen

- Master-Mapping: `/tmp/migration_master_mapping.json`
- MU-Plugin Source: `/tmp/canonical-migration.php`
- Original Migration-Mapping-Doku: `/root/obsidian-vault/01-Projekte/Kuiper-Marketing-Web/2026-05-28_Migration-Mapping-brandschutzdozenten-to-kuiper-safety.md`
