# Product Direction

NusaTestLab started as a CLI-based SaaS/API testing tool.

The long-term direction is to become a production-ready SaaS testing platform that can help builders test deployed SaaS prototypes and production applications.

## Current Product Status

Current version:

```txt
Version: 0.6.0
Status : CLI testing framework with test suites and CI export
```

NusaTestLab currently works primarily through terminal commands and JSON configuration files.

It is useful for:

- API-oriented SaaS testing
- profile-based test scenarios
- security dry-run scenarios
- business data validation
- inventory/report consistency checks
- test suite orchestration
- JSON, Markdown, and JUnit XML reporting

## Target Product Vision

NusaTestLab should evolve into a testing platform where a user can:

1. Add a deployed SaaS URL.
2. Configure test accounts and roles.
3. Run UI, API, auth, security, and business-flow tests.
4. View screenshots, traces, errors, and risk scores.
5. Get recommendations for fixing risky or failing areas.
6. Manage test scenarios from a GUI.

Example target user flow:

```txt
User adds https://my-saas.vercel.app
User selects tests to run
NusaTestLab opens the website in a browser
NusaTestLab checks pages, buttons, forms, API calls, auth, roles, and flows
NusaTestLab shows failed areas, risk score, screenshots, and suggested fixes
```

## Product Positioning

NusaTestLab is intended to become:

```txt
A SaaS testing assistant for developers, founders, and technical QA teams.
```

It should help users answer:

- Is my SaaS prototype ready for user testing?
- Are my key pages working?
- Are my buttons and forms functional?
- Are my APIs reachable and safe?
- Are role boundaries respected?
- Which areas are risky before launch?
- What should I fix first?

## Development Direction

The next development phase should focus on production readiness:

1. Browser testing engine.
2. GUI dashboard.
3. Scenario builder.
4. Risk and recommendation engine.
5. Project/workspace management.
6. Optional GitHub/repository-aware suggestions.

## Important Note

NusaTestLab is not yet a GUI testing platform.

Current NusaTestLab is a CLI-first foundation. The production platform vision requires additional work.
