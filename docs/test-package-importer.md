# Test Package Importer

NusaTestLab mendukung import test package agar profile dapat dipindahkan antar project.

## Tujuan

Package importer membantu:

- restore profile dari package JSON
- membagikan profile testing ke project lain
- membuat profile template reusable
- mengimpor profile dengan nama baru
- validasi checksum sebelum import

## Basic Import

```bash
npm run cli -- package:import exports/packages/ai-umkm-test-package.json
```

## Import Dengan Nama Baru

```bash
npm run cli -- package:import exports/packages/ai-umkm-test-package.json --profile-name imported-ai-umkm
```

## Overwrite

```bash
npm run cli -- package:import exports/packages/ai-umkm-test-package.json --overwrite
```

## Skip Checksum

Hanya gunakan jika package berasal dari sumber terpercaya:

```bash
npm run cli -- package:import exports/packages/ai-umkm-test-package.json --skip-checksum
```

## Setelah Import

Cek profile:

```bash
npm run cli -- profiles show imported-ai-umkm
```

Run smoke test:

```bash
npm run cli -- run imported-ai-umkm
```

Run security dry-run:

```bash
npm run cli -- security:run -p imported-ai-umkm --mode dry-run
```

Run performance dry-run:

```bash
npm run cli -- performance:run -p imported-ai-umkm --mode dry-run
```

## Keamanan Path

Importer hanya menerima file JSON dengan relative path aman.

Path seperti ini akan ditolak:

```bash
../file.json
/root/file.json
C:\secret\file.json
```
