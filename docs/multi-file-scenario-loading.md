# Multi-file Scenario Loading

NusaTestLab mendukung multi-file scenario loading untuk memudahkan pengembangan scenario secara modular.

## Core Scenarios

Core scenarios dibaca dari:

```txt
profiles/<profile>/scenarios/*.json
Security Scenarios

Security runner membaca:

profiles/<profile>/security.scenarios.json
profiles/<profile>/security.*.json

Contoh:

profiles/ai-umkm/security.scenarios.json
profiles/ai-umkm/security.cashier-profit-denied.json
profiles/ai-umkm/security.tenant-isolation.json
Performance Scenarios

Performance runner membaca:

profiles/<profile>/performance.scenarios.json
profiles/<profile>/performance.*.json

Contoh:

profiles/ai-umkm/performance.scenarios.json
profiles/ai-umkm/performance.products-list-load.json
profiles/ai-umkm/performance.sales-report-load.json
AI Scenarios

AI runner membaca:

profiles/<profile>/ai.scenarios.json
profiles/<profile>/ai.*.json

Contoh:

profiles/ai-umkm/ai.scenarios.json
profiles/ai-umkm/ai.prompt-injection-basic.json
profiles/ai-umkm/ai.tenant-boundary.json
Duplicate ID Protection

NusaTestLab akan menolak scenario jika ada duplicate id.

Contoh error:

Duplicate security scenario id found: cashier-profit-denied
Rekomendasi Naming

Gunakan nama file modular:

security.<scenario-name>.json
performance.<scenario-name>.json
ai.<scenario-name>.json

Contoh:

security.cashier-profit-denied.json
performance.products-list-load.json
ai.prompt-injection-basic.json

