# Dashboard and Risk Scoring

NusaTestLab v0.4.0 menambahkan static dashboard dan risk scoring.

## Tujuan

Dashboard digunakan untuk melihat ringkasan hasil testing terbaru dari semua modul:

- core scenario testing
- inventory validation
- report validation
- security testing
- AI testing
- performance testing
- transaction simulation

## Build Dashboard

Jalankan test report terlebih dahulu:

```bash
npm run cli -- run ai-umkm
npm run validate:inventory
npm run validate:reports
npm run security:dry
npm run performance:dry
npm run performance:simulate

Jika fitur AI tersedia:

npm run ai:dry

Lalu build dashboard:

npm run dashboard:build
Output

Dashboard dibuat di:

results/dashboard/index.html
results/dashboard/dashboard.json
Risk Scoring

Risk score dihitung dari:

jumlah failed test
jumlah warning
jumlah issues
missing report
severity sinyal dari module

Risk level:

0-19   : low
20-49  : medium
50-79  : high
80-100 : critical
Catatan

Dashboard ini masih static HTML.

Tahap berikutnya bisa menambahkan:

web dashboard server
historical comparison
trend chart
failed scenario explorer
risk scoring per severity
