# Browser Testing Quickstart

This guide explains how to use the first NusaTestLab browser testing engine.

## Install Browser Dependencies

```bash
npm install
npx playwright install chromium
```

## Run a Browser Test

```bash
npm run browser:run -- --url https://example.com --max-links 5
```

Or directly:

```bash
npx tsx src/index.ts browser:run --url https://example.com --max-links 5
```

## What It Checks

The current browser test checks:

- page can be opened
- final URL after redirects
- page title
- console errors
- page runtime errors
- failed network requests
- basic broken links
- screenshot capture

## Reports

Reports are generated in:

```txt
results/latest-browser-report.json
results/latest-browser-report.md
```

Screenshots are generated in:

```txt
results/browser-screenshots/
```

## Example Output

```txt
NusaTestLab Browser Test
-----------------------
Target URL : https://example.com
Final URL  : https://example.com/
Status     : passed
Risk Score : 0
Issues     : 0
Console Err: 0
Page Err   : 0
Requests   : 0 failed
Links      : 0 checked, 0 broken
Screenshot : results/browser-screenshots/<timestamp>-screenshot.png
```

## Notes

This is not yet a full GUI testing platform.

The current browser engine is a CLI-first foundation for future UI testing capabilities.
