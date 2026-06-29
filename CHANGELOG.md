# Changelog

All notable changes to NusaTestLab will be documented in this file.

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
- Documentation for performance testing and concurrent transaction simulation.

### AI UMKM Coverage

Performance coverage now includes:

- health check endpoint baseline
- products list endpoint baseline
- sales report endpoint baseline
- concurrent cashier transaction simulation
- local stock consistency validation under simulated transaction load

### Notes

Live performance testing requires the target SaaS API to be running. Transaction simulation runs locally using generated AI UMKM dummy dataset.

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
