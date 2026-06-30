# NusaTestLab

NusaTestLab adalah standalone SaaS testing tool untuk membantu developer mengetes aplikasi SaaS berbasis API.

Profile pertama yang disediakan adalah `ai-umkm`, yaitu profile testing untuk sistem SaaS seperti AI UMKM.

## Current Version

```bash
Version: 0.5.0
Status : Standalone SaaS Testing Platform
```

## Features

NusaTestLab saat ini mendukung:

- CLI testing workflow
- target SaaS configuration
- HTTP API connector
- profile-based testing
- generic SaaS profile
- AI UMKM testing profile
- SaaS profile scaffolding
- scenario template generator
- multi-file scenario loading
- exportable test packages
- test package importer
- dummy minimarket data generator
- inventory validation
- business report validation
- basic security testing
- performance testing
- concurrent transaction simulation
- dashboard and risk scoring
- historical dashboard comparison
- JSON and Markdown reports

## Installation

```bash
npm install
```

Copy environment file:

```bash
cp .env.example .env
```

Di Windows PowerShell:

```bash
Copy-Item .env.example .env
```

## Basic Commands

Show target config:

```bash
npm run cli -- info
```

List profiles:

```bash
npm run cli -- profiles list
```

Show profile:

```bash
npm run cli -- profiles show ai-umkm
```

Run AI UMKM profile scenarios:

```bash
npm run cli -- run ai-umkm
```

Run generic SaaS profile scenarios:

```bash
npm run cli -- run generic-saas
```

## Create New SaaS Profile

```bash
npm run cli -- profile:create clinic-saas --display-name "Clinic SaaS Testing Profile"
```

Custom roles and modules:

```bash
npm run cli -- profile:create clinic-saas --roles owner,admin,doctor,staff --modules api,auth,patients,appointments,billing,security,performance
```

## Create Scenario Template

Core scenario:

```bash
npm run cli -- scenario:create clinic-saas core patient-registration-basic --module patients
```

Security scenario:

```bash
npm run cli -- scenario:create clinic-saas security no-token-auth-me --role none --path /api/auth/me
```

Performance scenario:

```bash
npm run cli -- scenario:create clinic-saas performance health-check-load --path /health
```

## Multi-file Scenario Loading

NusaTestLab supports modular scenario files:

```bash
profiles/<profile>/security.scenarios.json
profiles/<profile>/security.*.json
profiles/<profile>/performance.scenarios.json
profiles/<profile>/performance.*.json
profiles/<profile>/ai.scenarios.json
profiles/<profile>/ai.*.json
```

## Export and Import Test Packages

Export profile package:

```bash
npm run cli -- package:export ai-umkm
```

Import package as new profile:

```bash
npm run cli -- package:import exports/packages/ai-umkm-test-package.json --profile-name imported-ai-umkm
```

## Dummy Data

Generate default AI UMKM dataset:

```bash
npm run generate:data
```

## Business Validators

Validate inventory:

```bash
npm run validate:inventory
```

Validate reports:

```bash
npm run validate:reports
```

## Security Testing

Dry-run:

```bash
npm run security:dry
```

Live mode:

```bash
npm run cli -- security:run --mode live
```

## Performance Testing

Dry-run:

```bash
npm run performance:dry
```

Generic profile:

```bash
npm run performance:generic
```

Live mode:

```bash
npm run cli -- performance:run --mode live
```

## Concurrent Transaction Simulation

Generate dataset first:

```bash
npm run generate:data
```

Run simulation:

```bash
npm run performance:simulate
```

## Dashboard

Build dashboard:

```bash
npm run dashboard:build
```

Compare dashboard snapshots:

```bash
npm run dashboard:compare
```

## Recommended Full Local Flow

- npm run cli -- run ai-umkm
- npm run generate:data
- npm run validate:inventory
- npm run validate:reports
- npm run security:dry
- npm run performance:dry
- npm run performance:simulate
- npm run dashboard:build
- npm run dashboard:compare
- npm run package:export -- ai-umkm
- npm run build

## Reports

Runtime reports are generated in:

```bash
results/
```

Runtime exports are generated in:

```bash
exports/packages/
```

Runtime reports and generated packages are ignored by Git.

## Documentation

See:

- docs/architecture.md
- docs/profile-system.md
- docs/profile-scaffolding.md
- docs/scenario-template-generator.md
- docs/multi-file-scenario-loading.md
- docs/exportable-test-packages.md
- docs/test-package-importer.md
- docs/http-api-connector.md
- docs/ai-umkm-profile.md
- docs/dummy-data-and-validators.md
- docs/security-testing.md
- docs/performance-testing.md
- docs/concurrent-transaction-simulation.md
- docs/dashboard-and-risk-scoring.md
- docs/historical-dashboard-comparison.md
- docs/release-v0.1.0.md
- docs/release-v0.2.0.md
- docs/release-v0.3.0.md
- docs/release-v0.4.0.md
- docs/release-v0.5.0.md
- docs/roadmap.md
