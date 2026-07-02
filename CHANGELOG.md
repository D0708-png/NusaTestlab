# Changelog

## [1.0.0-alpha] - GUI Dashboard Alpha

### Added

- Local GUI dashboard builder.
- `gui:build` command.
- `gui:open` command.
- Static HTML dashboard output.
- Summary cards for suite, browser, and browser scenario reports.
- Dashboard documentation and quickstart.

### Notes

This is an alpha local GUI layer. It is not yet a hosted SaaS dashboard or scenario editor.
All notable changes to NusaTestLab will be documented in this file.

## [0.9.0] - Browser Scenario Manager

### Added

- Browser scenario manager commands.
- List browser scenarios.
- Show browser scenario details.
- Create browser scenarios from CLI.
- Add scenario steps from CLI.
- Enable scenario steps.
- Disable scenario steps.
- Delete scenario steps.
- Browser scenario manager documentation.

### Notes

This release makes browser testing more configurable by allowing users to manage which parts of a website should be tested.
## [0.8.0] - Browser Scenario Testing

### Added

- Browser scenario testing.
- `browser:scenario` CLI command.
- Example browser scenario for `https://example.com`.
- Step-based browser testing.
- JSON browser scenario report.
- Markdown browser scenario report.
- Browser scenario screenshot artifacts.
- `browser:scenario:example` npm script.

### Notes

This release adds the first foundation for a future GUI scenario builder.
## [0.7.0] - Browser Testing Engine

### Added

- Browser testing engine powered by Playwright.
- `browser:run` CLI command.
- Target URL browser testing.
- Screenshot capture.
- Console error detection.
- Page runtime error detection.
- Failed network request detection.
- Basic broken link checks.
- Browser risk score.
- Browser report output in JSON and Markdown.
- Browser testing documentation and quickstart guide.

### Notes

This is the first production-roadmap milestone toward UI and deployed website testing. It is not yet a full GUI testing platform.
## [0.6.0] - Test Suites and CI Export

### Added

- Configurable test suites.
- `suites` CLI command group.
- `suites list` command.
- `suites show` command.
- `suites run` command.
- Default AI UMKM local suite.
- Default Generic SaaS local suite.
- Suite runner with task execution.
- Suite task support for:
  - core scenario testing
  - inventory validation
  - report validation
  - security testing
- JSON suite report output.
- Markdown suite report output.
- JUnit-style XML suite report output.
- Failure-only console output mode.
- Failure-only Markdown report mode.
- CI-friendly npm scripts:
  - `suites:list`
  - `suites:generic`
  - `suites:ai-umkm`
  - `suites:generic:failures`
  - `suites:ai-umkm:failures`

### Notes

Performance and dashboard suite tasks are reserved in the suite type system, but default v0.6.0 suites only use commands that are available in the current mainline implementation.

## [0.5.0] - Standalone SaaS Testing Platform

### Added

- SaaS profile scaffolding.
- `profile:create` CLI command.
- Scenario template generator.
- `scenario:create` CLI command.
- Multi-file scenario loading.
- Exportable test packages.
- `package:export` CLI command.
- Test package importer.
- `package:import` CLI command.
- Checksum validation during package import.
- Safe path validation for imported package files.

## [0.4.0] - Dashboard and Risk Scoring

### Added

- Static dashboard generator.
- Dashboard JSON summary.
- Risk scoring engine.
- Historical dashboard comparison.

## [0.3.0] - Performance Testing

### Added

- Performance testing engine.
- Performance metrics calculation.
- Performance threshold validation.
- Concurrent transaction simulation.

## [0.2.0] - AI Testing Expansion

### Added

- AI response testing engine.
- Prompt injection testing scenarios.
- Dataset-grounded AI scenario generation.

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



