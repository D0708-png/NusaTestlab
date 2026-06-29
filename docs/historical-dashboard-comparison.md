# Historical Dashboard Comparison

NusaTestLab dapat membandingkan dashboard snapshot terbaru dengan snapshot sebelumnya.

## Tujuan

Fitur ini membantu melihat apakah kualitas sistem membaik atau memburuk dari test run sebelumnya.

Yang dibandingkan:

- overall risk score
- total tests
- passed tests
- failed tests
- warnings
- issues
- risk score per module
- failed delta per module
- issue delta per module

## Build Snapshot

Setiap kali command berikut dijalankan:

```bash
npm run dashboard:build

NusaTestLab akan membuat snapshot di:

results/dashboard/history/
Compare Latest Snapshots
npm run dashboard:compare

Output:

results/dashboard/comparison.json
results/dashboard/comparison.md
Trend

Trend yang mungkin muncul:

baseline  : belum cukup snapshot untuk dibandingkan
improved  : risk/failure/issue menurun
regressed : risk/failure/issue meningkat
unchanged : tidak ada perubahan berarti
Recommended Flow
npm run dashboard:build
npm run dashboard:compare

Untuk hasil yang lebih bermakna, jalankan dashboard build setelah test suite selesai:

npm run cli -- run ai-umkm
npm run validate:inventory
npm run validate:reports
npm run security:dry
npm run performance:dry
npm run performance:simulate
npm run dashboard:build
npm run dashboard:compare

