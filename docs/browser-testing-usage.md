# Browser Testing Usage

This document explains how to use the initial NusaTestLab browser testing engine.

## Install Dependency

The browser testing engine uses Playwright.

```powershell
npm install -D playwright
npx playwright install chromium
```

## Basic Run

Run against a public website:

```powershell
npm run browser:run -- --url https://example.com
```

Or direct command:

```powershell
npx tsx src/index.ts browser:run --url https://example.com
```

## Run Against a Vercel or Netlify SaaS Prototype

Example:

```powershell
npm run browser:run -- --url https://your-saas.vercel.app --max-links 30
```

## Options

```txt
--url <url>              Target deployed website URL.
--max-links <number>    Maximum links to check from the page. Default: 20.
--include-external      Include external links. Default: false.
--timeout <ms>          Page load timeout. Default: 30000.
--width <px>            Browser viewport width. Default: 1365.
--height <px>           Browser viewport height. Default: 768.
```

## Report Files

After a run, check:

```txt
results/latest-browser-report.json
results/latest-browser-report.md
results/browser-screenshots/
```

## Current Limitations

This is not a full end-to-end browser testing system yet.

It does not click buttons, fill forms, or test authenticated flows yet.

Those will be added in the next browser testing milestones.
