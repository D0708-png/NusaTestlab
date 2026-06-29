# NusaTestLab v0.4.0 - Dashboard and Risk Scoring

NusaTestLab v0.4.0 menambahkan static dashboard dan risk scoring untuk melihat ringkasan hasil testing dari berbagai modul.

## Release Goal

Tujuan release ini adalah membuat NusaTestLab mampu menampilkan ringkasan kualitas sistem dari hasil report terbaru.

Dashboard membantu melihat:

- modul mana yang aman
- modul mana yang gagal
- modul mana yang belum punya report
- risk score keseluruhan
- risk score per module
- rekomendasi prioritas perbaikan
- perubahan kualitas dari snapshot sebelumnya

## Main Features

### Static Dashboard

Command:

```bash
npm run dashboard:build

Output:

results/dashboard/index.html
results/dashboard/dashboard.json
Risk Scoring

Risk score dihitung berdasarkan:

failed tests
warnings
issues
missing reports
module-level risk

Risk level:

0-19   : low
20-49  : medium
50-79  : high
80-100 : critical
Historical Snapshot

Setiap kali dashboard dibuild, snapshot JSON disimpan ke:

results/dashboard/history/
Dashboard Comparison

Command:

npm run dashboard:compare

Output:

results/dashboard/comparison.json
results/dashboard/comparison.md

Trend yang tersedia:

baseline
improved
regressed
unchanged
Recommended Flow
npm run cli -- run ai-umkm
npm run generate:data
npm run validate:inventory
npm run validate:reports
npm run security:dry
npm run performance:dry
npm run performance:simulate
npm run dashboard:build
npm run dashboard:compare

Jika AI testing tersedia di branch:

npm run ai:dry
npm run dashboard:build
npm run dashboard:compare
Release Status
Version: 0.4.0
Status : Dashboard and Risk Scoring
Mode   : Static dashboard
Next Version

v0.5.0 will focus on standalone SaaS testing platform features:

no-code scenario builder
custom profile wizard
reusable profile registry
SaaS profile templates
exportable test packages
