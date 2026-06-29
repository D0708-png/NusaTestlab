# Changelog

All notable changes to NusaTestLab will be documented in this file.

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
- Documentation for dashboard, risk scoring, and historical comparison.

### Dashboard Coverage

Dashboard currently summarizes:

- core scenario testing
- inventory validation
- report validation
- security testing
- AI testing, if report is available
- performance testing
- concurrent transaction simulation

### Notes

Dashboard is currently static HTML. A web dashboard server, failed scenario explorer, and charts are planned for future versions.

## [0.3.0] - Performance Testing

### Added

- Performance testing engine.
- `performance:run` CLI command.
- Dry-run and live performance testing modes.
- Performance scenario file support through `profiles/<profile>/performance.scenarios.json`.
- Performance metrics calculation:
  - total requests
  - successful requests
  - failed requests
  - error rate
  - min latency
  - max latency
  - average latency
  - p95 latency
- Performance threshold validation:
  - max average latency
  - max p95 latency
  - max error rate
- Performance reports in JSON and Markdown.
- AI UMKM performance scenarios.
- Generic SaaS performance scenarios.
- Concurrent transaction simulation.
- Local cashier transaction simulation from AI UMKM dataset.
- Transaction throughput report.
- Negative stock validation after transaction simulation.
- Stock mismatch validation after transaction simulation.

## [0.2.0] - AI Testing Expansion

### Added

- AI response testing engine.
- `ai:run` CLI command.
- Dry-run and live AI testing modes.
- AI scenario file support through `profiles/<profile>/ai.scenarios.json`.
- Custom AI scenario file support using `ai:run --file`.
- AI response evaluator.
- Forbidden text checks.
- Forbidden regex pattern checks.
- Expected refusal checks.
- Prompt injection testing scenarios.
- Dataset-grounded AI scenario generator.
- `ai:generate-scenarios` CLI command.
- AI groundedness testing documentation.
- Prompt injection testing documentation.
- AI report output in JSON and Markdown.

## [0.1.0] - MVP Release

### Added

- Standalone SaaS testing project structure.
- CLI-based testing workflow.
- Target SaaS configuration through `.env`.
- HTTP API connector for probing target SaaS APIs.
- Profile-based testing system.
- Generic SaaS testing profile.
- AI UMKM testing profile.
- AI UMKM endpoint registry.
- AI UMKM data schema and test matrix.
- Scenario loader.
- Assertion engine.
- Test runner.
- JSON and Markdown test reports.
- Dummy minimarket data generator.
- AI UMKM inventory stock validator.
- AI UMKM business report validator.
- Basic security testing engine.
- Security scenario loader.
- Dry-run and live security test modes.
- Security report output in JSON and Markdown.
