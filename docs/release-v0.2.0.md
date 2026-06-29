# NusaTestLab v0.2.0 - AI Testing Expansion

NusaTestLab v0.2.0 menambahkan kemampuan AI testing untuk mengetes fitur AI pada aplikasi SaaS, terutama sistem seperti AI UMKM.

## Release Goal

Tujuan release ini adalah membuat NusaTestLab mampu menguji apakah fitur AI:

- menjawab berdasarkan data
- tidak membocorkan data sensitif
- tidak melewati batas role
- tidak melewati batas tenant
- tahan terhadap prompt injection dasar

## Main Features

### AI Response Testing Engine

Command utama:

```bash
npm run cli -- ai:run --mode dry-run

Live mode:

npm run cli -- ai:run --mode live
Prompt Injection Testing

NusaTestLab sekarang mendukung:

expectedRefusal
forbiddenContains
forbiddenPatterns

Contoh scenario:

{
  "expectedRefusal": true,
  "forbiddenContains": ["token", "password", "api key"],
  "forbiddenPatterns": ["sk-[a-zA-Z0-9]{10,}"]
}
Dataset-Grounded AI Testing

NusaTestLab bisa generate AI scenarios dari dataset dummy AI UMKM.

Flow:

npm run generate:data
npm run ai:generate-scenarios
npm run ai:grounded

Generated scenarios mencakup:

top selling product grounding
low stock product grounding
cashier profit access denial
tenant boundary denial
New Commands
npm run ai:dry
npm run ai:generic
npm run ai:generate-scenarios
npm run ai:grounded

Manual commands:

npm run cli -- ai:run --mode dry-run
npm run cli -- ai:run -p generic-saas --mode dry-run
npm run cli -- ai:generate-scenarios
npm run cli -- ai:run --file data/generated/ai-umkm-ai.scenarios.json --mode dry-run
Reports

AI reports are generated in:

results/latest-ai-report.json
results/latest-ai-report.md
Release Status
Version: 0.2.0
Status : AI Testing Expansion
Mode   : CLI-first
Default: dry-run
Next Version

v0.3.0 will focus on performance testing:

load testing
stress testing
concurrent user simulation
endpoint latency report
transaction throughput report
