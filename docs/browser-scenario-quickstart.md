# Browser Scenario Quickstart

This guide explains how to use browser scenario testing in NusaTestLab.

## What Is Browser Scenario Testing?

Browser scenario testing lets NusaTestLab run a sequence of browser actions against a deployed website.

Example use cases:

- open a deployed SaaS URL
- check important text
- check whether a button exists
- click a link or button
- capture screenshots
- generate JSON and Markdown reports

## Run the Example Scenario

```bash
npm run browser:scenario:example
```

Or directly:

```bash
npx tsx src/index.ts browser:scenario --file browser-scenarios/example.com.json
```

## Scenario Location

Browser scenarios are stored in:

```txt
browser-scenarios/
```

Example:

```txt
browser-scenarios/example.com.json
```

## Reports

After running a scenario, NusaTestLab writes:

```txt
results/latest-browser-scenario-report.json
results/latest-browser-scenario-report.md
```

Screenshots are saved to:

```txt
results/browser-scenario-screenshots/
```

## Current Limitations

Current browser scenario testing is still CLI-first.

It does not yet provide:

- GUI scenario builder
- visual screenshot diffing
- advanced form workflows
- multi-user auth flow manager
- hosted SaaS runner
