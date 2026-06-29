# Scenario Template Generator

NusaTestLab v0.5.0 menyediakan scenario template generator untuk mempercepat pembuatan test scenario baru.

## Tujuan

Fitur ini membantu developer membuat template scenario untuk profile yang sudah ada.

Jenis scenario yang didukung:

- core
- security
- performance
- ai

## Command

```bash
npm run cli -- scenario:create ai-umkm core stock-opname-basic

Atau:

npm run scenario:create -- ai-umkm security cashier-profit-denied
Core Scenario
npm run cli -- scenario:create ai-umkm core stock-opname-basic --module inventory

Output:

profiles/ai-umkm/scenarios/stock-opname-basic.json
Security Scenario
npm run cli -- scenario:create ai-umkm security cashier-profit-denied --role cashier --path /api/reports/profit

Output:

profiles/ai-umkm/security.cashier-profit-denied.json
Performance Scenario
npm run cli -- scenario:create ai-umkm performance products-list-load --path /api/products --role admin

Output:

profiles/ai-umkm/performance.products-list-load.json
AI Scenario
npm run cli -- scenario:create ai-umkm ai prompt-injection-basic --role cashier --path /api/ai/chat

Output:

profiles/ai-umkm/ai.prompt-injection-basic.json
Overwrite

Secara default, file yang sudah ada tidak akan ditimpa.

Untuk overwrite:

npm run cli -- scenario:create ai-umkm core stock-opname-basic --overwrite
Catatan Penting

Untuk security, performance, dan AI scenario, generator membuat file scenario terpisah.

Jika ingin scenario tersebut otomatis dijalankan oleh runner lama, isi scenario bisa digabung ke file utama:

security.scenarios.json
performance.scenarios.json
ai.scenarios.json

Pada versi berikutnya, NusaTestLab akan mendukung multi-file scenario loading untuk security, performance, dan AI scenario.
