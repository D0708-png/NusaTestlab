# Exportable Test Packages

NusaTestLab v0.5.0 mendukung export profile testing menjadi portable test package.

## Tujuan

Exportable test package membuat profile NusaTestLab bisa:

- dibagikan ke project lain
- disimpan sebagai artifact release
- dijadikan template profile reusable
- dikirim ke tim QA/developer lain
- diarsipkan sebagai baseline testing profile

## Command

```bash
npm run cli -- package:export ai-umkm
```

Atau:

```bash
npm run package:export -- ai-umkm
```

## Output

Default output:

```bash
exports/packages/ai-umkm-test-package.json
```

Custom output:

```bash
npm run cli -- package:export ai-umkm --output exports/packages --file ai-umkm-v1.package.json
```

## Isi Package

Package berisi:

- metadata package
- profile config
- endpoints
- core scenarios
- security scenarios
- performance scenarios
- AI scenarios jika tersedia
- data schema jika tersedia
- test matrix jika tersedia
- checksum sederhana

Contoh struktur:

```bash
{
  "packageFormat": "nusa-testlab-package",
  "packageVersion": "1.0",
  "exportedAt": "2026-06-29T00:00:00.000Z",
  "source": {
    "profileName": "ai-umkm",
    "profileDir": "profiles/ai-umkm",
    "nusaTestLabVersion": "0.5.0"
  },
  "summary": {
    "files": 10,
    "coreScenarioFiles": 7,
    "securityScenarioFiles": 1,
    "performanceScenarioFiles": 1,
    "aiScenarioFiles": 1
  },
  "files": [],
  "checksum": "abc12345"
}
```

File yang Diexport

NusaTestLab akan membaca semua file JSON di dalam folder profile.

Contoh:

- profiles/ai-umkm/profile.config.json
- profiles/ai-umkm/endpoints.json
- profiles/ai-umkm/scenarios/*.json
- profiles/ai-umkm/security.scenarios.json
- profiles/ai-umkm/security.*.json
- profiles/ai-umkm/performance.scenarios.json
- profiles/ai-umkm/performance.*.json
- profiles/ai-umkm/ai.scenarios.json
- profiles/ai-umkm/ai.*.json
- profiles/ai-umkm/data-schema.json
- profiles/ai-umkm/test-matrix.json

## Git Ignore

Generated package di folder berikut di-ignore oleh Git:

```bash
exports/packages/
```

File .gitkeep tetap disimpan agar folder tersedia.

Next Step

Versi berikutnya akan menambahkan package import:

```bash
npm run cli -- package:import exports/packages/ai-umkm-test-package.json
```

## Import Package

Package yang sudah diexport bisa diimport kembali ke folder `profiles/`.

```bash
npm run cli -- package:import exports/packages/ai-umkm-test-package.json
```

Jika profile tujuan sudah ada, gunakan nama baru:

```bash
npm run cli -- package:import exports/packages/ai-umkm-test-package.json --profile-name imported-ai-umkm
```

Atau via npm script:

```bash
npm run package:import -- exports/packages/ai-umkm-test-package.json --profile-name imported-ai-umkm
```

## Overwrite Existing Profile

```bash
npm run cli -- package:import exports/packages/ai-umkm-test-package.json --overwrite
```

## Checksum Validation

Importer akan memvalidasi checksum package.

Jika checksum tidak valid, import akan gagal.

Untuk package yang benar-benar dipercaya, checksum bisa dilewati:

```bash
npm run cli -- package:import exports/packages/ai-umkm-test-package.json --skip-checksum
```

## Safe Import

Importer melindungi dari unsafe path seperti:

```bash
../outside-profile.json
/root/file.json
```

Semua file harus tetap berada di dalam folder profile tujuan.
