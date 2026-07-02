# NusaTestLab v1.0.0-alpha - GUI Dashboard Alpha

NusaTestLab v1.0.0-alpha introduces the first local GUI dashboard layer.

## Release Goal

The goal of this release is to make test results easier to read without depending only on terminal output.

This is not yet a hosted SaaS dashboard. It is a local static HTML dashboard generated from the latest NusaTestLab reports.

## Main Features

- Local GUI dashboard builder.
- `gui:build` command.
- `gui:open` command.
- Static HTML dashboard output.
- Reads latest suite report.
- Reads latest browser report.
- Reads latest browser scenario report.
- Shows status summary.
- Shows risk score summary.
- Shows available report artifacts.
- Keeps generated dashboard output ignored by Git.

## Output

The generated dashboard is written to:

```txt
results/gui-dashboard/index.html
```

## Commands

Build dashboard:

```bash
npm run gui:build
```

Open dashboard:

```bash
npm run gui:open
```

Recommended local flow:

```bash
npm run suites:ai-umkm
npm run browser:example
npm run browser:scenario:example
npm run gui:build
npm run gui:open
```

## Current Limitations

This release is an alpha GUI layer.

It does not yet provide:

- scenario editing from the GUI
- project database
- hosted SaaS mode
- login/team workspace
- scheduled testing
- clickable issue drilldown with traces
- in-dashboard test execution

Those features are planned for later production-ready milestones.

## Release Status

```txt
Version: 1.0.0-alpha
Status : GUI Dashboard Alpha
Mode   : Local static dashboard
```

## Next Direction

Recommended next focus:

- GUI report viewer improvements
- failed issue detail pages
- screenshot viewer
- scenario management UI
- project/workspace model
