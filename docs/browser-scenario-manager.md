# Browser Scenario Manager

Browser Scenario Manager adds CLI commands for managing browser scenario JSON files.

It allows users to list, show, create, and edit browser scenarios without manually editing JSON files.

## Commands

List scenarios:

```bash
npx tsx src/index.ts browser:scenario:list
```

Create a scenario:

```bash
npx tsx src/index.ts browser:scenario:create example-managed --base-url https://example.com --name "Example Managed Scenario" --force
```

Add an expectation step:

```bash
npx tsx src/index.ts browser:scenario:add-step example-managed --type expect-text --id expect-heading --text "Example Domain"
```

Add a link check step:

```bash
npx tsx src/index.ts browser:scenario:add-step example-managed --type check-links --id check-links --max-links 5
```

Show scenario details:

```bash
npx tsx src/index.ts browser:scenario:show example-managed
```

Disable a step:

```bash
npx tsx src/index.ts browser:scenario:disable-step example-managed --step-id check-links
```

Enable a step:

```bash
npx tsx src/index.ts browser:scenario:enable-step example-managed --step-id check-links
```

Delete a step:

```bash
npx tsx src/index.ts browser:scenario:delete-step example-managed --step-id check-links
```

Run the scenario:

```bash
npx tsx src/index.ts browser:scenario --file browser-scenarios/example-managed.json
```

## Current Status

This is still CLI-first. It is the foundation for a future GUI Scenario Builder.
