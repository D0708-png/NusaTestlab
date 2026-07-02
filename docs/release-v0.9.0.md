# NusaTestLab v0.9.0 - Browser Scenario Manager

NusaTestLab v0.9.0 adds browser scenario management commands.

## Release Goal

This release makes browser scenario testing easier to manage from the CLI.

Users can now create browser scenarios, add steps, enable or disable steps, delete steps, inspect scenario details, and run the scenario with the existing browser scenario runner.

## Main Features

- list browser scenarios
- show browser scenario details
- create browser scenarios
- add scenario steps
- enable scenario steps
- disable scenario steps
- delete scenario steps
- run managed browser scenarios

## Example Commands

List scenarios:

```bash
npx tsx src/index.ts browser:scenario:list
```

Create scenario:

```bash
npx tsx src/index.ts browser:scenario:create my-saas-homepage --base-url https://my-saas.vercel.app --name "My SaaS Homepage" --force
```

Add text expectation:

```bash
npx tsx src/index.ts browser:scenario:add-step my-saas-homepage --type expect-text --id expect-heading --text "Welcome"
```

Disable step:

```bash
npx tsx src/index.ts browser:scenario:disable-step my-saas-homepage --step-id expect-heading
```

Run scenario:

```bash
npx tsx src/index.ts browser:scenario --file browser-scenarios/my-saas-homepage.json
```

## Release Status

```txt
Version: 0.9.0
Status : Browser Scenario Manager
Mode   : CLI-first
```

## Next Direction

The next product direction should be GUI dashboard foundation and visual report viewing.