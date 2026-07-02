# GUI Dashboard Alpha Quickstart

This guide explains how to use the first local GUI dashboard in NusaTestLab.

## What It Is

The GUI Dashboard Alpha is a static HTML dashboard generated from the latest NusaTestLab reports.

It helps users view test status without reading only terminal logs.

## What It Is Not Yet

It is not yet:

- a hosted SaaS dashboard
- a full web app
- a scenario editor
- a test runner UI
- a login-based workspace

## Generate Reports First

Run some tests first:

```bash
npm run suites:ai-umkm
npm run browser:example
npm run browser:scenario:example
```

These commands generate reports in:

```txt
results/
```

## Build Dashboard

```bash
npm run gui:build
```

Expected output:

```txt
NusaTestLab GUI Dashboard
-------------------------
Output     : results\gui-dashboard\index.html
Suite      : found
Browser    : found
Scenario   : found
```

## Open Dashboard

```bash
npm run gui:open
```

Or open manually:

```txt
D:\nusa-testlab\results\gui-dashboard\index.html
```

## Generated Files

The dashboard is generated at:

```txt
results/gui-dashboard/index.html
```

Generated dashboard files are runtime artifacts and should not be committed to Git.

## Recommended Flow

```bash
npm run suites:ai-umkm
npm run browser:example
npm run browser:scenario:example
npm run gui:build
npm run gui:open
```

## Troubleshooting

If the dashboard shows missing reports, run the related tests first:

```bash
npm run suites:ai-umkm
npm run browser:example
npm run browser:scenario:example
```

If the dashboard file does not exist, run:

```bash
npm run gui:build
```
