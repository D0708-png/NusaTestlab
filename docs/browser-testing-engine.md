# Browser Testing Engine

NusaTestLab Browser Testing Engine is the first step toward testing deployed SaaS prototypes through a real browser.

## Status

```txt
Version target : v0.7.0
Status         : Initial browser testing engine
Mode           : CLI-first
GUI            : Not available yet
```

## Goal

The goal is to allow NusaTestLab to test deployed websites such as Netlify, Vercel, or other hosted SaaS prototypes.

The first implementation focuses on:

- opening a target URL in Chromium
- capturing a screenshot
- detecting page load failures
- collecting browser console errors
- collecting page runtime errors
- collecting failed network requests
- checking links on the loaded page
- generating JSON and Markdown reports

## Command

```bash
npm run browser:run -- --url https://example.com
```

Direct command:

```bash
npx tsx src/index.ts browser:run --url https://example.com
```

## Output

Browser reports are generated in:

```txt
results/latest-browser-report.json
results/latest-browser-report.md
results/browser-screenshots/
```

## Risk Score

The initial risk score is calculated from detected issues:

```txt
critical issue : +40
high issue     : +25
medium issue   : +10
low issue      : +5
maximum score  : 100
```

## What This Engine Can Detect

Current initial browser test can detect:

- page cannot load
- HTTP status 400+ on main page
- JavaScript console errors
- uncaught browser page errors
- failed network requests
- broken links from the page
- screenshot capture for visual inspection

## What This Engine Does Not Do Yet

The initial implementation does not yet support:

- clicking buttons automatically
- filling forms automatically
- recording videos
- Playwright trace viewer
- mobile/desktop comparison
- visual diff testing
- login/session flow
- user-defined browser scenarios
- GUI report viewer
