# NusaTestLab

NusaTestLab adalah standalone SaaS testing tool untuk membantu developer mengetes aplikasi SaaS berbasis API.

Profile pertama yang disediakan adalah `ai-umkm`, yaitu profile testing untuk sistem SaaS seperti AI UMKM.

## MVP Features

NusaTestLab v0.1.0 menyediakan:

- CLI testing workflow
- target SaaS configuration
- HTTP API connector
- profile-based testing
- generic SaaS profile
- AI UMKM testing profile
- dummy minimarket data generator
- inventory validation
- business report validation
- basic security testing
- JSON and Markdown reports

## Installation

```bash
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

Show AI UMKM profile:

npm run cli -- profiles show ai-umkm

Run AI UMKM profile scenarios:

npm run cli -- run ai-umkm

Run generic SaaS profile scenarios:

npm run cli -- run generic-saas
Generate Dummy Data
npm run generate:data

Custom size:

npm run cli -- generate:data --products 500 --suppliers 5 --purchases 1000 --sales 5000

Default output:

data/generated/ai-umkm-dataset.json
Validate Inventory
npm run validate:inventory

This validates:

finalStock = initial + purchase - sale + return - damaged + adjustment
Validate Reports
npm run validate:reports

This validates:

total products
total stock units
low stock products
total sales
total purchases
gross profit
top selling products
Security Testing

Dry-run mode:

npm run security:dry

Live mode:

npm run cli -- security:run --mode live

Live mode requires the target SaaS API and role tokens to be configured in .env.

API Probe
npm run cli -- probe --path /health

With role:

npm run cli -- probe --path /api/reports/profit --role cashier
Reports

Runtime reports are generated in:

results/

Examples:

results/latest-report.md
results/latest-inventory-validation.md
results/latest-report-validation.md
results/latest-security-report.md

Runtime reports are ignored by Git.

Documentation

See:

docs/architecture.md
docs/profile-system.md
docs/http-api-connector.md
docs/ai-umkm-profile.md
docs/dummy-data-and-validators.md
docs/security-testing.md
docs/release-v0.1.0.md
docs/roadmap.md
Version
Version: 0.1.0
Status : MVP Release

