# NusaTestLab v0.6.0 - Test Suites and CI Export

NusaTestLab v0.6.0 menambahkan test suite runner dan output yang lebih ramah CI.

## Release Goal

Tujuan release ini adalah membuat NusaTestLab bisa menjalankan beberapa jenis test dalam satu suite terkonfigurasi.

Release ini menambahkan:

- configurable test suites
- suite runner
- JSON suite report
- Markdown suite report
- JUnit-style XML report
- failure-only output mode
- CI-friendly npm scripts

## Main Features

### Test Suite Config

Suite config disimpan di folder:

```bash
suites/
```

Contoh:

- suites/ai-umkm.local.json
- suites/generic-saas.local.json

### List Suites

```bash
npm run suites:list
```

### Run Generic SaaS Suite

```bash
npm run suites:generic
```

### Run AI UMKM Suite

```bash
npm run suites:ai-umkm
```

### Failure-only Mode

```bash
npm run suites:generic:failures
npm run suites:ai-umkm:failures
```

Mode ini hanya menampilkan failed/skipped task di console output.

## CI Reports

Suite runner menghasilkan:

```bash
results/latest-suite-report.json
results/latest-suite-report.md
results/latest-suite-report.xml
```

JUnit-style XML report dapat digunakan oleh CI tools seperti:

- GitHub Actions
- GitLab CI
- Jenkins
- CircleCI

## Current Suite Coverage

AI UMKM local suite menjalankan:

- core scenario test
- inventory validation
- report validation
- security dry-run

Generic SaaS local suite menjalankan:

- core scenario test
- security dry-run

## Release Status

```bash
Version: 0.6.0
Status : Test Suites and CI Export
Mode   : CLI-first
```

## Next Version

v0.7.0 planned focus:

- restore and align performance/dashboard implementation into main
- suite task presets
- optional task support
- richer CI summaries
- GitHub Actions workflow template
