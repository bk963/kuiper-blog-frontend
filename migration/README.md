# Migration: brandschutzdozenten.de → Kuiper Blog

## Schritte

1. **Fetch WP posts + media** (Node):
   ```bash
   node migration/fetch-wp-posts.js
   # → wp-dump.json
   ```

2. **Import to all 3 PocketBases** (Python):
   ```bash
   python3 migration/import-to-pb.py
   # Inserts 36 posts into blog_articles on dev+staging+prod via docker exec sqlite3
   ```

## Was wird importiert
- 36 Posts aus https://brandschutzdozenten.de/blog/
- Featured-Image-URLs (als `hero_image_url` Text-Feld, nicht als PB-File)
- Slug, Titel, Content, Excerpt, Publish-Datum
- Kategorie: alle als "Brandschutz" (Kuiper's `catbrand11111115`)
- Heuristische Meta-Generierung (Meta-Description, Focus-Keyword, Reading-Time, Word-Count)

## Schema-Änderung
`blog_articles` bekommt zwei extra TEXT-Spalten:
- `hero_image_url` — externe Bild-URL (brandschutzdozenten.de hotlink)
- `original_url` — Original-Permalink (für Referenz)

## Phase 2b (optional, noch nicht durchgeführt)
- Claude-API SEO-Pass (bessere Meta-Texte, Secondary-Keywords, FAQs)
- Bilder lokal herunterladen + in PocketBase Storage übertragen
- Interne Verlinkung zwischen Artikeln
