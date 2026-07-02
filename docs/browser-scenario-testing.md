# Browser Scenario Testing

NusaTestLab Browser Scenario Testing adds configurable browser UI flows on top of the basic browser testing engine.

## Goal

This feature lets a user define which page, button, form, link, or text should be tested from a JSON scenario file.

It is the first step toward a future GUI scenario builder.

## Current Status

This is still CLI-first.

Users can add or delete browser test coverage by editing JSON files in:

```txt
browser-scenarios/
```

## Run Scenario

```bash
npx tsx src/index.ts browser:scenario --file browser-scenarios/example.com.json
```

Or use the example npm script:

```bash
npm run browser:scenario:example
```

## Supported Step Types

- `goto`
- `expect-text`
- `click`
- `fill`
- `wait-for-selector`
- `check-links`
- `screenshot`

## Reports

Reports are generated in:

```txt
results/latest-browser-scenario-report.json
results/latest-browser-scenario-report.md
```

Screenshots are generated in:

```txt
results/browser-scenario-screenshots/
```

## Add or Delete Tested Areas

To add a tested area, add a new step to the JSON scenario.

To delete a tested area, remove the step from the JSON scenario.

To disable a tested area without deleting it, remove it from the active scenario or move it to another file.

## Limitations

This is not yet a visual GUI editor.

It does not automatically understand every app feature. Good results require the user to define important pages, buttons, forms, and expected behavior.
