<?php
/**
 * Plugin Name: Canonical Migration brandschutzdozenten → kuiper-safety
 * Description: Setzt Canonical-URLs für migrierte Posts auf blog.kuiper-safety.de. SEO-Soft-Migration ohne Ranking-Verlust.
 * Author:      Kuiper Safety
 * Version:     1.0.0
 * Created:     2026-05-28
 *
 * Reversibel: Datei löschen → alter Zustand.
 * Wirkung: Rank-Math + WP-Core Canonical + Open-Graph URL zeigen auf blog.kuiper-safety.de/brandschutz/SLUG.
 *
 * Status:    Phase 2 (Soft-Cutover) der Migration.
 * Nach 4-8 Wochen Phase 3 (Monitoring grün) folgt Phase 4 mit 301-Redirects (.htaccess).
 */

if (!defined('ABSPATH')) { exit; }

/**
 * Mapping: WordPress-Post-Slug → neue Master-URL auf blog.kuiper-safety.de
 * 31 Tier-1+2-URLs (≥20 Klicks/180T in GSC), Reihenfolge nach Klicks DESC.
 */
function ks_migration_canonical_map() {
    return [
    'brandschutztueren-und-feststellanlagen' => 'https://blog.kuiper-safety.de/brandschutz/brandschutztueren-und-feststellanlagen', // 1792 Klicks/180T
    'brandklassen-a-b-c-d-f-din-en-2' => 'https://blog.kuiper-safety.de/brandschutz/brandklassen-a-b-c-d-f-din-en-2', // 1030 Klicks/180T
    'brandschutzordnung-din-14096' => 'https://blog.kuiper-safety.de/brandschutz/brandschutzordnung-din-14096', // 867 Klicks/180T
    'evakuierungskonzept' => 'https://blog.kuiper-safety.de/brandschutz/evakuierungskonzept', // 482 Klicks/180T
    'feuerloescher' => 'https://blog.kuiper-safety.de/brandschutz/feuerloescher', // 446 Klicks/180T
    'evakuierungsuebung' => 'https://blog.kuiper-safety.de/brandschutz/evakuierungsuebung', // 345 Klicks/180T
    'feuerloeschsprays-brandbekaempfung-handliche-format' => 'https://blog.kuiper-safety.de/brandschutz/feuerloeschsprays-brandbekaempfung-handliche-format', // 330 Klicks/180T
    'jaehrliche-brandschutzunterweisung' => 'https://blog.kuiper-safety.de/brandschutz/jaehrliche-brandschutzunterweisung', // 329 Klicks/180T
    'brandschutz-im-altenheim-pflegeheim' => 'https://blog.kuiper-safety.de/brandschutz/brandschutz-im-altenheim-pflegeheim', // 188 Klicks/180T
    'pfas-verbot-in-feuerloeschern' => 'https://blog.kuiper-safety.de/brandschutz/pfas-verbot-in-feuerloeschern', // 188 Klicks/180T
    'feststellanlagen-nach-din-14677' => 'https://blog.kuiper-safety.de/brandschutz/feststellanlagen-nach-din-14677', // 173 Klicks/180T
    'brandmeldeanlagen-pflicht-vorschriften' => 'https://blog.kuiper-safety.de/brandschutz/brandmeldeanlagen-pflicht-vorschriften', // 169 Klicks/180T
    'flucht-und-rettungswege-anforderungen' => 'https://blog.kuiper-safety.de/brandschutz/flucht-und-rettungswege-anforderungen', // 157 Klicks/180T
    'brandverhuetungsschau-vorbereitung' => 'https://blog.kuiper-safety.de/brandschutz/brandverhuetungsschau-vorbereitung', // 146 Klicks/180T
    'pruefung-brandschutztechnischer-einrichtungen' => 'https://blog.kuiper-safety.de/brandschutz/pruefung-brandschutztechnischer-einrichtungen', // 116 Klicks/180T
    'evakuierungshelfer-schulung-brandschutz' => 'https://blog.kuiper-safety.de/brandschutz/evakuierungshelfer-schulung-brandschutz', // 106 Klicks/180T
    'fluorfreie-feuerloescher-pfas' => 'https://blog.kuiper-safety.de/brandschutz/fluorfreie-feuerloescher-pfas', // 85 Klicks/180T
    'photovoltaikanlagen-und-brandschutz' => 'https://blog.kuiper-safety.de/brandschutz/photovoltaikanlagen-und-brandschutz', // 81 Klicks/180T
    'brandschutzbegehung-im-unternehmen' => 'https://blog.kuiper-safety.de/brandschutz/brandschutzbegehung-im-unternehmen', // 79 Klicks/180T
    'brandschutzbeauftragter-fortbildung-externer' => 'https://blog.kuiper-safety.de/brandschutz/brandschutzbeauftragter-fortbildung-externer', // 76 Klicks/180T
    'ausbildung-zum-brandschutzhelfer' => 'https://blog.kuiper-safety.de/brandschutz/ausbildung-zum-brandschutzhelfer', // 73 Klicks/180T
    'selbsttaetige-feuerloeschanlagen' => 'https://blog.kuiper-safety.de/brandschutz/selbsttaetige-feuerloeschanlagen', // 61 Klicks/180T
    'asr-a2-2-massnahmen-gegen-braende' => 'https://blog.kuiper-safety.de/brandschutz/asr-a2-2-massnahmen-gegen-braende', // 57 Klicks/180T
    'rwa-rauch-und-waerme-abzugsanlagen' => 'https://blog.kuiper-safety.de/brandschutz/rwa-rauch-und-waerme-abzugsanlagen', // 56 Klicks/180T
    'arbeitsstaettenverordnung-arbstaettv' => 'https://blog.kuiper-safety.de/brandschutz/arbeitsstaettenverordnung-arbstaettv', // 48 Klicks/180T
    'lagern-von-gefahrstoffen-brandschutz' => 'https://blog.kuiper-safety.de/brandschutz/lagern-von-gefahrstoffen-brandschutz', // 44 Klicks/180T
    'betrieblicher-brandschutz-nach-dguv-205-001' => 'https://blog.kuiper-safety.de/brandschutz/betrieblicher-brandschutz-nach-dguv-205-001', // 40 Klicks/180T
    'sicherheitsbeleuchtung-notbeleuchtung' => 'https://blog.kuiper-safety.de/brandschutz/sicherheitsbeleuchtung-notbeleuchtung', // 36 Klicks/180T
    'externer-brandschutzbeauftragter' => 'https://blog.kuiper-safety.de/brandschutz/externer-brandschutzbeauftragter', // 30 Klicks/180T
    'audits-brandschutzpruefungen-iso9001-iso14001' => 'https://blog.kuiper-safety.de/brandschutz/audits-brandschutzpruefungen-iso9001-iso14001', // 25 Klicks/180T
    'vorbeugender-brandschutz' => 'https://blog.kuiper-safety.de/brandschutz/vorbeugender-brandschutz', // 23 Klicks/180T
    ];
}

/**
 * Helper: liefert neue Canonical-URL für aktuellen Post oder false.
 */
function ks_migration_target_url() {
    if (!is_singular()) return false;
    global $post;
    if (empty($post) || empty($post->post_name)) return false;
    $map = ks_migration_canonical_map();
    return isset($map[$post->post_name]) ? $map[$post->post_name] : false;
}

// --- Rank Math: Canonical überschreiben ---
add_filter('rank_math/frontend/canonical', function($canonical) {
    $target = ks_migration_target_url();
    return $target ? $target : $canonical;
}, 99);

// --- Rank Math: Open Graph URL synchron mit Canonical ---
add_filter('rank_math/opengraph/url', function($og_url) {
    $target = ks_migration_target_url();
    return $target ? $target : $og_url;
}, 99);

// --- WP-Core: get_canonical_url Filter (Fallback falls Rank Math mal deaktiviert) ---
add_filter('get_canonical_url', function($canonical_url, $post) {
    if (empty($post) || empty($post->post_name)) return $canonical_url;
    $map = ks_migration_canonical_map();
    return isset($map[$post->post_name]) ? $map[$post->post_name] : $canonical_url;
}, 99, 2);

// --- Schema/JSON-LD WebPage @id auf neue URL umbiegen (Rank Math Schema) ---
add_filter('rank_math/json_ld', function($data, $jsonld) {
    $target = ks_migration_target_url();
    if (!$target) return $data;
    if (isset($data['WebPage']['@id'])) $data['WebPage']['@id'] = $target . '#webpage';
    if (isset($data['WebPage']['url'])) $data['WebPage']['url'] = $target;
    if (isset($data['BlogPosting']['mainEntityOfPage']['@id'])) $data['BlogPosting']['mainEntityOfPage']['@id'] = $target . '#webpage';
    return $data;
}, 99, 2);

/* -- Debug-Header (entfernen wenn nicht mehr nötig) -- */
add_action('wp_head', function() {
    $target = ks_migration_target_url();
    if ($target) echo "\n<!-- ks-canonical-migration: → " . esc_url($target) . " -->\n";
}, 1);
