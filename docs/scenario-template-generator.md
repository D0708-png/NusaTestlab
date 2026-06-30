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
```

Atau:

```bash
npm run scenario:create -- ai-umkm security cashier-profit-denied
```

## Core Scenario

```bash
npm run cli -- scenario:create ai-umkm core stock-opname-basic --module inventory
```

Output:

```bash
profiles/ai-umkm/scenarios/stock-opname-basic.json
```

Core scenario otomatis dibaca dari folder:

```bash
profiles/<profile>/scenarios/*.json
```

## Security Scenario

```bash
npm run cli -- scenario:create ai-umkm security cashier-profit-denied --role cashier --path /api/reports/profit
```

Output:

```bash
profiles/ai-umkm/security.cashier-profit-denied.json
```

Security runner otomatis membaca:

```bash
profiles/<profile>/security.scenarios.json
profiles/<profile>/security.*.json
```

## Performance Scenario

```bash
npm run cli -- scenario:create ai-umkm performance products-list-load --path /api/products --role admin
```

Output:

```bash
profiles/ai-umkm/performance.products-list-load.json
```

Performance runner otomatis membaca:

```bash
profiles/<profile>/performance.scenarios.json
profiles/<profile>/performance.*.json
```

## AI Scenario

```bash
npm run cli -- scenario:create ai-umkm ai prompt-injection-basic --role cashier --path /api/ai/chat
```

Output:

```bash
profiles/ai-umkm/ai.prompt-injection-basic.json
```

AI runner otomatis membaca:

```bash
profiles/<profile>/ai.scenarios.json
profiles/<profile>/ai.*.json
```

## Overwrite

Secara default, file yang sudah ada tidak akan ditimpa.

Untuk overwrite:

```bash
npm run cli -- scenario:create ai-umkm core stock-opname-basic --overwrite
```

## Catatan

Mulai Major Commit 22, generated security, performance, dan AI scenario file tidak perlu digabung manual ke file utama. Runner akan membaca multi-file scenario secara otomatis.
