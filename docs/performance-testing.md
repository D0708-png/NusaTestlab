# Performance Testing

NusaTestLab v0.3.0 menambahkan performance testing engine.

## Tujuan

Performance testing digunakan untuk mengecek performa baseline endpoint SaaS, seperti:

- health check
- product list
- sales report
- endpoint lain yang sering diakses

## Command

Dry-run:

```bash
npm run performance:dry
```

Profile generic:

```bash
npm run performance:generic
```

Live mode:

```bash
npm run cli -- performance:run --mode live
```

Profile tertentu:

```bash
npm run cli -- performance:run -p ai-umkm --mode live
```

## Scenario File

Setiap profile bisa memiliki:

```bash
profiles/<profile-name>/performance.scenarios.json
```

Contoh:

```bash
{
  "scenarios": [
    {
      "id": "products-list-performance",
      "name": "Products list endpoint baseline performance",
      "method": "GET",
      "path": "/api/products",
      "role": "admin",
      "expectedStatus": 200,
      "requests": 30,
      "concurrency": 5,
      "maxAverageMs": 800,
      "maxP95Ms": 1500,
      "maxErrorRate": 0.02
    }
  ]
}
```

## Metrics

NusaTestLab menghitung:

- total requests
- successful requests
- failed requests
- error rate
- min latency
- max latency
- average latency
- p95 latency
- Dry-Run vs Live

Dry-run hanya memvalidasi konfigurasi scenario.

Live mode benar-benar mengirim request ke target SaaS API.

## Reports

Output:

```bash
results/latest-performance-report.json
results/latest-performance-report.md
```

## Catatan

Performance engine ini adalah baseline awal.

Tahap berikutnya bisa menambahkan:

- transaction simulation
- cashier concurrent checkout
- ramp-up duration
- request body support
- CSV export
- historical performance comparison
