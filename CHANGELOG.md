# Changelog

All notable changes to NusaTestLab will be documented in this file.

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

### AI UMKM Coverage

AI UMKM profile now includes AI tests for:

- top selling product answer grounding
- low stock answer grounding
- instruction override prompt injection
- system prompt exposure
- SQL/data exfiltration attempt
- role escalation attempt
- tenant boundary bypass attempt
- server log/environment variable exposure
- dataset-grounded product scenarios

### Notes

This release keeps dry-run as the safe default. Live AI testing requires the target SaaS AI endpoint to be running and configured.

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
- Documentation for architecture, profile system, HTTP connector, AI UMKM profile, dummy data, validators, and security testing.
