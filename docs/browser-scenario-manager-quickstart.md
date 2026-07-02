# Browser Scenario Manager Quickstart

This guide explains how to manage browser testing scenarios in NusaTestLab.

## List Scenarios

```bash
npx tsx src/index.ts browser:scenario:list
```

## Show Scenario

```bash
npx tsx src/index.ts browser:scenario:show example.com
```

## Create New Scenario

```bash
npx tsx src/index.ts browser:scenario:create my-saas-homepage --base-url https://my-saas.vercel.app --name "My SaaS Homepage" --force
```

## Add Expect Text Step

```bash
npx tsx src/index.ts browser:scenario:add-step my-saas-homepage --type expect-text --id expect-heading --text "Welcome"
```

## Add Check Links Step

```bash
npx tsx src/index.ts browser:scenario:add-step my-saas-homepage --type check-links --id check-links --max-links 10
```

## Add Screenshot Step

```bash
npx tsx src/index.ts browser:scenario:add-step my-saas-homepage --type screenshot --id homepage-screenshot
```

## Disable Step

```bash
npx tsx src/index.ts browser:scenario:disable-step my-saas-homepage --step-id check-links
```

## Enable Step

```bash
npx tsx src/index.ts browser:scenario:enable-step my-saas-homepage --step-id check-links
```

## Delete Step

```bash
npx tsx src/index.ts browser:scenario:delete-step my-saas-homepage --step-id check-links
```

## Run Scenario

```bash
npx tsx src/index.ts browser:scenario --file browser-scenarios/my-saas-homepage.json
```

## Report Output

Browser scenario reports are generated in:

```txt
results/latest-browser-scenario-report.json
results/latest-browser-scenario-report.md
```

Screenshots are generated in:

```txt
results/browser-scenario-screenshots/
```