# Changelog

All notable changes to NusaTestLab will be documented in this file.

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

### MVP Scope

NusaTestLab v0.1.0 focuses on testing SaaS systems similar to AI UMKM, especially:

- inventory logic
- sales and purchase data
- report consistency
- role-based access
- tenant isolation readiness
- basic API security checks

### Notes

This release is CLI-first. Dashboard, AI response testing, prompt injection testing, and load testing are planned for future versions.
