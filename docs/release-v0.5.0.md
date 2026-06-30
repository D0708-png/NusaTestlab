# NusaTestLab v0.5.0 - Standalone SaaS Testing Platform

NusaTestLab v0.5.0 membuat project ini lebih reusable sebagai standalone SaaS testing platform.

## Release Goal

Tujuan release ini adalah membuat NusaTestLab bisa dipakai untuk banyak SaaS, bukan hanya profile bawaan seperti `ai-umkm` dan `generic-saas`.

Release ini menambahkan kemampuan untuk:

- membuat profile SaaS baru
- membuat scenario template baru
- membaca scenario modular multi-file
- export profile menjadi portable test package
- import package ke project NusaTestLab lain

## Main Features

### SaaS Profile Scaffolding

Command:

```bash
npm run cli -- profile:create clinic-saas --display-name "Clinic SaaS Testing Profile"
```

Output:

```bash
profiles/clinic-saas/profile.config.json
profiles/clinic-saas/endpoints.json
profiles/clinic-saas/scenarios/core.smoke.json
profiles/clinic-saas/security.scenarios.json
profiles/clinic-saas/performance.scenarios.json
```

## Scenario Template Generator

Command:

```bash
npm run cli -- scenario:create ai-umkm security cashier-profit-denied --role cashier --path /api/reports/profit
```

Supported scenario types:

```bash
core
security
performance
ai
```

## Multi-file Scenario Loading

Security runner reads:

```bash
profiles/<profile>/security.scenarios.json
profiles/<profile>/security.*.json
```

Performance runner reads:

```bash
profiles/<profile>/performance.scenarios.json
profiles/<profile>/performance.*.json
```

AI runner reads, if AI testing is available:

```bash
profiles/<profile>/ai.scenarios.json
profiles/<profile>/ai.*.json
```

## Exportable Test Packages

Command:

```bash
npm run cli -- package:export ai-umkm
```

Output:

```bash
exports/packages/ai-umkm-test-package.json
```

Package contains:

```bash
- profile config
- endpoints
- core scenarios
- security scenarios
- performance scenarios
- AI scenarios if available
- data schema if available
- test matrix if available
- checksum
```

## Test Package Importer

Command:

```bash
npm run cli -- package:import exports/packages/ai-umkm-test-package.json --profile-name imported-ai-umkm
```

Importer supports:

```bash
- checksum validation
- safe path validation
- overwrite protection
- profile rename on import
```

## Recommended Platform Flow

```bash
npm run cli -- profile:create clinic-saas --display-name "Clinic SaaS Testing Profile"
npm run cli -- scenario:create clinic-saas security no-token-auth-me --role none --path /api/auth/me
npm run cli -- scenario:create clinic-saas performance health-check-load --path /health
npm run cli -- security:run -p clinic-saas --mode dry-run
npm run cli -- performance:run -p clinic-saas --mode dry-run
npm run cli -- package:export clinic-saas
```

## Release Status

```bash
Version: 0.5.0
Status : Standalone SaaS Testing Platform
Mode   : CLI-first
```

## Next Version

v0.6.0 planned focus:

```bash
plugin-ready test execution
configurable test suites
suite runner
CI-friendly exit codes and summaries
JUnit-style export
```
