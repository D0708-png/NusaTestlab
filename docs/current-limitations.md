# Current Limitations

This document explains what NusaTestLab can and cannot do in the current version.

## Current Version

```txt
Version: 0.6.0
Status : CLI testing framework with test suites and CI export
```

## What Works Today

NusaTestLab currently supports:

- CLI usage through PowerShell/terminal
- profile-based testing
- core scenario tests
- dummy data generation
- inventory validation
- report validation
- basic security dry-run testing
- profile scaffolding
- scenario template generation
- export/import test packages
- test suite runner
- JSON suite report
- Markdown suite report
- JUnit XML suite report
- failure-only suite output

## What Does Not Exist Yet

NusaTestLab does not yet have:

- GUI dashboard
- browser automation testing
- website crawling
- button click testing
- visual regression testing
- screenshot comparison
- form interaction testing from a browser
- hosted SaaS mode
- project/workspace database
- built-in recommendation engine

## Website Testing Limitation

Current NusaTestLab is not yet equivalent to Playwright, Cypress, or Selenium.

It does not currently open a deployed website and click through the UI.

For example, current NusaTestLab cannot yet automatically test:

- whether a button works in the browser
- whether a modal opens
- whether a form submits correctly from the UI
- whether the mobile layout is broken
- whether visual elements are misaligned

These capabilities are planned for the browser testing phase.

## API and SaaS Testing Strength

NusaTestLab is currently strongest for:

- API-oriented testing
- role/security testing
- profile-based test configuration
- business rule validation
- regression suite execution
- CI-friendly reporting

## Recommended Current Use

Use current NusaTestLab for technical validation of SaaS logic, profiles, and test suites.

Use browser automation tools such as Playwright/Cypress for UI click testing until NusaTestLab has its own browser testing engine.

## Future Direction

The next major development direction should be browser testing and GUI reporting.
