# NusaTestLab v0.3.0 - Performance Testing

NusaTestLab v0.3.0 menambahkan kemampuan performance testing untuk mengetes baseline performa sistem SaaS.

## Release Goal

Tujuan release ini adalah membuat NusaTestLab mampu menguji:

- performa endpoint SaaS
- latency endpoint penting
- error rate
- p95 latency
- concurrent transaction simulation
- konsistensi stok saat banyak transaksi disimulasikan

## Main Features

### Performance Testing Engine

Command utama:

```bash
npm run performance:dry
```

Live mode:

```bash
npm run cli -- performance:run --mode live
```

Generic SaaS profile:

```bash
npm run performance:generic
```

### Performance Metrics

NusaTestLab menghitung:

- total requests
- successful requests
- failed requests
- error rate
- min latency
- max latency
- average latency
- p95 latency
- Threshold Validation

Scenario performance mendukung threshold:

```bash
{
  "maxAverageMs": 800,
  "maxP95Ms": 1500,
  "maxErrorRate": 0.02
}
```

### Concurrent Transaction Simulation

Command:

```bash
npm run performance:simulate
```

Custom simulation:

```bash
npm run cli -- performance:simulate-transactions --transactions 5000 --concurrency 20 --max-items 5
```

Simulation report mencakup:

- total transactions
- completed transactions
- rejected transactions
- total items sold
- total sales amount
- negative stock products
- stock mismatch products
- duration
- throughput per second
- Reports

Performance reports:

```bash
results/latest-performance-report.json
results/latest-performance-report.md
```

Transaction simulation reports:

```bash
results/latest-transaction-simulation.json
results/latest-transaction-simulation.md
Release Status
Version: 0.3.0
Status : Performance Testing
Mode   : CLI-first
Default: dry-run
Next Version
```

v0.4.0 will focus on dashboard and test history:

- web dashboard
- historical test comparison
- risk scoring
- failed scenario explorer
- security risk summary
