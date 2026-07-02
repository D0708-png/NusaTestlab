# NusaTestLab v0.7.0 - Browser Testing Engine

NusaTestLab v0.7.0 adds the first browser-based website testing capability.

## Release Goal

The goal of this release is to start moving NusaTestLab from a CLI SaaS/API testing framework toward a production-ready SaaS testing platform.

This release adds a Playwright-powered browser testing engine that can open a deployed website URL, capture a screenshot, detect basic runtime issues, and generate reports.

## Main Features

- Browser test command: `browser:run`
- Playwright Chromium support
- Target URL testing
- Final URL tracking
- Page load status
- Screenshot capture
- Console error detection
- Page error detection
- Failed network request detection
- Basic link checking
- Browser test risk score
- JSON browser report
- Markdown browser report

## Example Usage

```bash
npx tsx src/index.ts browser:run --url https://example.com --max-links 5
```

Or via npm script:

```bash
npm run browser:run -- --url https://example.com --max-links 5
```

## Output

Runtime reports are generated in:

```txt
results/latest-browser-report.json
results/latest-browser-report.md
```

Screenshots are generated in:

```txt
results/browser-screenshots/
```

Runtime outputs are ignored by Git.

## Current Scope

This is the first production-roadmap browser testing milestone.

It can currently test:

- whether a deployed page opens
- whether the browser reports console errors
- whether the page throws runtime errors
- whether network requests fail
- whether selected links are broken
- whether a screenshot can be captured

## Current Limitations

This release does not yet include:

- GUI dashboard
- scenario builder
- click-flow testing
- form-fill testing
- auth/session recording
- visual diff comparison
- multi-page crawler
- recommendation engine

These are planned for future production-roadmap milestones.

## Recommended Next Milestone

The next milestone should focus on browser scenario configuration:

- page tests
- button click tests
- form submit tests
- expected text checks
- screenshot on failed step
- browser test suites

## Release Status

```txt
Version: 0.7.0
Status : Browser Testing Engine
Mode   : CLI-first with browser automation foundation
```
