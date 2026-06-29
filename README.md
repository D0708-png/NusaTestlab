# NusaTestLab

NusaTestLab adalah standalone SaaS testing tool untuk membantu developer mengetes aplikasi SaaS berbasis API.

Profile pertama yang disediakan adalah `ai-umkm`, yaitu profile testing untuk sistem SaaS seperti AI UMKM.

## Current Version

```txt
Version: 0.2.0
Status : AI Testing Expansion
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
AI response testing
prompt injection testing
dataset-grounded AI scenario generation
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
AI Testing

Run AI dry-run scenarios:

npm run ai:dry

Run generic AI dry-run scenarios:

npm run ai:generic

Live AI testing:

npm run cli -- ai:run --mode live
Dataset-Grounded AI Testing

Generate dataset:

npm run generate:data

Generate AI scenarios from dataset:

npm run ai:generate-scenarios

Run generated grounded AI scenarios:

npm run ai:grounded

Manual command:

npm run cli -- ai:run --file data/generated/ai-umkm-ai.scenarios.json --mode dry-run
Reports

Runtime reports are generated in:

results/

Examples:

results/latest-report.md
results/latest-inventory-validation.md
results/latest-report-validation.md
results/latest-security-report.md
results/latest-ai-report.md

Runtime reports are ignored by Git.

Documentation

See:

docs/architecture.md
docs/profile-system.md
docs/http-api-connector.md
docs/ai-umkm-profile.md
docs/dummy-data-and-validators.md
docs/security-testing.md
docs/ai-testing.md
docs/prompt-injection-testing.md
docs/ai-groundedness-testing.md
docs/release-v0.1.0.md
docs/release-v0.2.0.md
docs/roadmap.md

