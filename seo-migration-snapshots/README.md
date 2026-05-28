# SEO-Migration: Disaster-Recovery-Snapshots

**Zweck:** Alle kritischen Migrations-Artefakte versioniert in Git als Off-Site-Backup.
Im Disaster-Fall (Mainserver crasht, KAS-Account weg, PB-Daten korrupt) sind alle Daten hier rekonstruierbar.

## Inhalt

| Ordner/Datei | Was | Wofür |
|---|---|---|
| `plugins/ks-canonical-migration-v1.php` | MU-Plugin Source | Re-upload via FTP nach `/brandschutzdozenten.de/wp-content/mu-plugins/` |
| `mappings/migration_master_mapping.json` | 321 URLs alt↔neu, GSC-Klicks | Re-Build 301-Redirect-Set für Phase 4 |
| `article-backups/<slug>.json` | Pre-Optimization meta_title/desc/keywords/faqs | Rollback auf Vor-Optimierungs-Stand |
| `opts/<slug>-LIVE.json` | Aktuell live optimierte Werte | Re-apply nach PB-Restore |
| `blog_articles-FULL-DUMP-*.json` | Komplett-Backup ALLER blog_articles | Disaster-Recovery PB-Restore |
| `MIGRATION-MASTER-PLAN.md` | komplette Doku | Migration nachvollziehen |

## Rollback-Szenarien

### MU-Plugin geht verloren (KAS-File-Crash)
```bash
# Re-Upload via FTP — Plugin ist in plugins/ks-canonical-migration-v1.php
```

### Optimierungen werden überschrieben (Bk editiert in PB-Admin)
```bash
# opts/<slug>-LIVE.json zeigt aktuellen Soll-Stand
# Vergleichen mit PB-Live-Werten → re-applien wenn nötig
```

### Komplette PB-Daten weg
```bash
# blog_articles-FULL-DUMP-*.json ist vollständig — kann re-importiert werden
```

## Frequenz

- Initial-Snapshot: 2026-05-28
- Daily-Dump: per Cron (Task #12)
