# NusaTestLab

NusaTestLab adalah standalone SaaS testing tool untuk membantu developer mengetes aplikasi SaaS berbasis API.

Profile pertama yang disediakan adalah `ai-umkm`, yaitu profile testing untuk sistem SaaS seperti AI UMKM.

## Current Version

```bash
Version: 0.7.0
Status : Browser Testing Engine
```

## Product Direction

NusaTestLab is currently a CLI-first SaaS/API testing framework.

The long-term goal is to evolve it into a production-ready SaaS testing platform that can test deployed SaaS prototypes, including UI flows, buttons, forms, APIs, auth, role access, risk scoring, screenshots, and recommendations.

Current status:

```txt
Current app : CLI testing framework
GUI         : Not available yet
Browser UI testing : Planned
Production SaaS platform : Planned
```

Read more:

```txt
docs/product-direction.md
docs/production-roadmap.md
docs/current-limitations.md
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
- configurable test suites
- suite runner
- JSON suite report
- Markdown suite report
- JUnit-style XML suite report
- failure-only suite output
- dummy minimarket data generator
- inventory validation
- business report validation
- basic security testing
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


## Browser Testing

NusaTestLab v0.7.0 introduces the first browser testing engine.

Run a deployed website test:

```bash
npm run browser:run -- --url https://example.com --max-links 5
```

The browser test can currently check:

- page load status
- final URL
- console errors
- page runtime errors
- failed network requests
- basic broken links
- screenshot capture

Browser test outputs:

```txt
results/latest-browser-report.json
results/latest-browser-report.md
results/browser-screenshots/
```

Read more:

```txt
docs/browser-testing-engine.md
docs/browser-testing-usage.md
docs/browser-testing-quickstart.md
docs/release-v0.7.0.md
```

## Test Suites

List suites:

```bash
npm run suites:list
```

Run Generic SaaS local suite:

```bash
npm run suites:generic
```

Run AI UMKM local suite:

```bash
npm run suites:ai-umkm
```

Failure-only output:

```bash
npm run suites:generic:failures
npm run suites:ai-umkm:failures
```

Suite reports are generated in:

```bash
results/latest-suite-report.json
results/latest-suite-report.md
results/latest-suite-report.xml
```

## Create New SaaS Profile

```bash
npm run cli -- profile:create clinic-saas --display-name "Clinic SaaS Testing Profile"
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

## Recommended Full Local Flow

```bash
npm run cli -- info
npm run cli -- profiles list
npm run suites:generic
npm run suites:ai-umkm
npm run suites:ai-umkm:failures
npm run build
```

## Runtime Outputs

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

```bash
docs/architecture.md
docs/profile-system.md
docs/profile-scaffolding.md
docs/scenario-template-generator.md
docs/multi-file-scenario-loading.md
docs/exportable-test-packages.md
docs/test-package-importer.md
docs/release-v0.5.0.md
docs/release-v0.6.0.md
docs/roadmap.md
```


