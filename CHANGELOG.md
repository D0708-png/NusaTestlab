# Changelog

All notable changes to NusaTestLab will be documented in this file.

## [0.5.0] - Standalone SaaS Testing Platform

### Added

- SaaS profile scaffolding.
- `profile:create` CLI command.
- Generated profile templates:
  - `profile.config.json`
  - `endpoints.json`
  - `scenarios/core.smoke.json`
  - `security.scenarios.json`
  - `performance.scenarios.json`
- Scenario template generator.
- `scenario:create` CLI command.
- Template generation for:
  - core scenarios
  - security scenarios
  - performance scenarios
  - AI scenarios, when AI testing is available
- Multi-file scenario loading.
- Security runner support for:
  - `security.scenarios.json`
  - `security.*.json`
- Performance runner support for:
  - `performance.scenarios.json`
  - `performance.*.json`
- AI runner support for:
  - `ai.scenarios.json`
  - `ai.*.json`
- Duplicate scenario ID protection.
- Exportable test packages.
- `package:export` CLI command.
- Test package metadata.
- Test package checksum.
- Test package importer.
- `package:import` CLI command.
- Import package with a new profile name.
- Import overwrite protection.
- Checksum validation during package import.
- Safe path validation for imported package files.
- Documentation for profile scaffolding, scenario templates, multi-file loading, package export, and package import.

### Platform Coverage

NusaTestLab can now be reused for new SaaS systems by generating a new profile scaffold, adding scenarios, and exporting/importing those profiles as portable test packages.

### Notes

This release makes NusaTestLab more reusable as a standalone SaaS testing platform.

## [0.4.0] - Dashboard and Risk Scoring

### Added

- Static dashboard generator.
- `dashboard:build` CLI command.
- Dashboard JSON summary.
- Dashboard HTML output.
- Risk scoring engine.
- Overall risk score.
- Module-level risk score.
- Module recommendations.
- Missing report detection.
- Dashboard history snapshots.
- Historical dashboard comparison.
- `dashboard:compare` CLI command.
- Comparison report in JSON and Markdown.
- Trend detection:
  - baseline
  - improved
  - regressed
  - unchanged

## [0.3.0] - Performance Testing

### Added

- Performance testing engine.
- `performance:run` CLI command.
- Dry-run and live performance testing modes.
- Performance scenario file support.
- Performance metrics calculation:
  - total requests
  - successful requests
  - failed requests
  - error rate
  - min latency
  - max latency
  - average latency
  - p95 latency
- Performance threshold validation.
- Performance reports in JSON and Markdown.
- Concurrent transaction simulation.
- Transaction throughput report.
- Local stock consistency validation under simulated load.

## [0.2.0] - AI Testing Expansion

### Added

- AI response testing engine.
- `ai:run` CLI command.
- Dry-run and live AI testing modes.
- Prompt injection testing scenarios.
- Expected refusal validation.
- Forbidden content validation.
- Dataset-grounded AI scenario generation.
- AI report output in JSON and Markdown.

## [0.1.0] - MVP Release

### Added

- Standalone SaaS testing project structure.
- CLI-based testing workflow.
- Target SaaS configuration through `.env`.
- HTTP API connector.
- Profile-based testing system.
- Generic SaaS testing profile.
- AI UMKM testing profile.
- Scenario loader.
- Assertion engine.
- Test runner.
- JSON and Markdown test reports.
- Dummy minimarket data generator.
- Inventory validator.
- Business report validator.
- Basic security testing engine.
