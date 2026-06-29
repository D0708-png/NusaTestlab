# Concurrent Transaction Simulation

NusaTestLab menyediakan simulasi transaksi kasir concurrent untuk menguji logika stok pada sistem seperti AI UMKM.

## Tujuan

Simulasi ini membantu mengecek:

- stok tidak menjadi negatif
- transaksi ditolak jika stok tidak cukup
- perhitungan stok tetap konsisten
- throughput transaksi simulasi
- potensi masalah saat banyak kasir melakukan transaksi bersamaan

## Flow

```txt
generate:data
    ↓
performance:simulate-transactions
    ↓
transaction simulation report
Generate Dataset
npm run generate:data
Run Simulation
npm run performance:simulate

Custom:

npm run cli -- performance:simulate-transactions --transactions 5000 --concurrency 20 --max-items 5
Metrics

Report mencakup:

total transactions
completed transactions
rejected transactions
total items sold
total sales amount
negative stock products
stock mismatch products
duration
throughput per second
Output
results/latest-transaction-simulation.json
results/latest-transaction-simulation.md
Catatan

Simulasi ini berjalan secara lokal dari dataset dummy.

Tahap berikutnya bisa menambahkan live checkout simulation ke target API.
