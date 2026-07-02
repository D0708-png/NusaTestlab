# NusaTestLab v0.8.0 - Browser Scenario Testing

NusaTestLab v0.8.0 adds browser scenario testing on top of the browser testing engine introduced in v0.7.0.

## Release Goal

The goal of this release is to let users define step-by-step browser checks using JSON scenario files.

This is the first foundation for a future GUI scenario builder where users can add, disable, edit, and delete website tests without manually editing code.

## Main Features

- Browser scenario files.
- Step-based browser testing.
- Scenario runner command.
- Example scenario for `https://example.com`.
- Page navigation checks.
- Text visibility checks.
- Element visibility checks.
- Click action checks.
- Screenshot capture during scenario execution.
- JSON browser scenario report.
- Markdown browser scenario report.
- Browser scenario screenshot artifacts.

## Commands

Run a browser scenario directly:

```bash
npx tsx src/index.ts browser:scenario --file browser-scenarios/example.com.json
```

Run the example scenario using npm:

```bash
npm run browser:scenario:example
```

## Reports

Browser scenario reports are generated in:

```txt
results/latest-browser-scenario-report.json
results/latest-browser-scenario-report.md
```

Screenshots are generated in:

```txt
results/browser-scenario-screenshots/
```

Runtime reports and screenshots are ignored by Git.

## Current Status

```txt
Version: 0.8.0
Status : Browser Scenario Testing
Mode   : CLI-first
```

## Next Direction

Planned next work:

- form input steps
- assertion steps
- multiple viewport testing
- screenshot comparison
- scenario builder GUI
- risk scoring improvements for browser scenarios
