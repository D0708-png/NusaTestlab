# NusaTestLab

NusaTestLab adalah standalone SaaS testing tool untuk membantu developer mengetes aplikasi SaaS berbasis API.

Profile pertama yang disediakan adalah `ai-umkm`, yaitu profile testing untuk sistem SaaS seperti AI UMKM.

## Current Version

```txt
Version: 0.4.0
Status : Dashboard and Risk Scoring
Features

NusaTestLab saat ini mendukung:

CLI testing workflow
target SaaS configuration
HTTP API connector
profile-based testing
generic SaaS profile
AI UMKM testing profile
dummy minimarket data generator
inventory validation
business report validation
basic security testing
AI response testing, jika branch/fitur tersedia
prompt injection testing, jika branch/fitur tersedia
performance testing
concurrent transaction simulation
dashboard and risk scoring
historical dashboard comparison
JSON and Markdown reports
Installation
npm install

Copy environment file:

cp .env.example .env

Di Windows PowerShell:

Copy-Item .env.example .env
Basic Commands

Show target config:

npm run cli -- info

List profiles:

npm run cli -- profiles list

Run AI UMKM profile scenarios:

npm run cli -- run ai-umkm

Run generic SaaS profile scenarios:

npm run cli -- run generic-saas
Dummy Data

Generate default AI UMKM dataset:

npm run generate:data

Custom size:

npm run cli -- generate:data --products 500 --suppliers 5 --purchases 1000 --sales 5000
Business Validators

Validate inventory:

npm run validate:inventory

Validate reports:

npm run validate:reports
Security Testing

Dry-run:

npm run security:dry

Live mode:

npm run cli -- security:run --mode live
Performance Testing

Dry-run:

npm run performance:dry

Generic profile:

npm run performance:generic

Live mode:

npm run cli -- performance:run --mode live
Concurrent Transaction Simulation

Generate dataset first:

npm run generate:data

Run simulation:

npm run performance:simulate

Custom simulation:

npm run cli -- performance:simulate-transactions --transactions 5000 --concurrency 20 --max-items 5
Dashboard

Build dashboard:

npm run dashboard:build

Output:

results/dashboard/index.html
results/dashboard/dashboard.json

Compare dashboard snapshots:

npm run dashboard:compare

Output:

results/dashboard/comparison.json
results/dashboard/comparison.md
Recommended Full Local Flow
npm run cli -- run ai-umkm
npm run generate:data
npm run validate:inventory
npm run validate:reports
npm run security:dry
npm run performance:dry
npm run performance:simulate
npm run dashboard:build
npm run dashboard:compare
npm run build
Reports

Runtime reports are generated in:

results/

Examples:

results/latest-report.md
results/latest-inventory-validation.md
results/latest-report-validation.md
results/latest-security-report.md
results/latest-performance-report.md
results/latest-transaction-simulation.md
results/dashboard/index.html
results/dashboard/dashboard.json
results/dashboard/comparison.md

Runtime reports are ignored by Git.

Documentation

See:

docs/architecture.md
docs/profile-system.md
docs/http-api-connector.md
docs/ai-umkm-profile.md
docs/dummy-data-and-validators.md
docs/security-testing.md
docs/performance-testing.md
docs/concurrent-transaction-simulation.md
docs/dashboard-and-risk-scoring.md
docs/historical-dashboard-comparison.md
docs/release-v0.1.0.md
docs/release-v0.2.0.md
docs/release-v0.3.0.md
docs/release-v0.4.0.md
docs/roadmap.md

