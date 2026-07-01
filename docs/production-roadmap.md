# Production Roadmap

This roadmap describes how NusaTestLab can evolve from a CLI testing framework into a production-ready SaaS testing platform.

## Phase 1 - Stabilize Current CLI Foundation

Status: Current

Goal:

Make the current CLI tool clear, reliable, and honest about its capabilities.

Scope:

- clarify README
- clarify current limitations
- document CLI usage
- document test suite usage
- align docs with available commands
- keep runtime artifacts out of Git

## Phase 2 - Browser Testing Engine

Goal:

Allow NusaTestLab to test deployed websites such as Netlify/Vercel SaaS prototypes.

Target capabilities:

- open a target URL in a real browser
- capture page screenshot
- detect page load failure
- detect console errors
- detect broken links
- click configured buttons
- fill configured forms
- verify expected text/result
- capture failed step screenshots
- produce browser test report

Candidate stack:

- Playwright
- TypeScript
- screenshot and trace artifacts

## Phase 3 - API and Backend Validation

Goal:

Strengthen backend testing for deployed SaaS applications.

Target capabilities:

- endpoint health checks
- status code checks
- response schema validation
- auth-required endpoint checks
- invalid token checks
- role boundary checks
- tenant isolation checks
- API latency checks

## Phase 4 - GUI Dashboard

Goal:

Make NusaTestLab usable without editing JSON manually.

Target capabilities:

- project list
- project detail
- target URL configuration
- run test button
- latest test status
- failed test list
- screenshots
- traces
- risk score
- recommendation panel

Candidate stack:

- Next.js
- React
- Tailwind CSS
- shadcn/ui
- SQLite for local mode

## Phase 5 - Scenario Builder

Goal:

Allow users to add, edit, disable, and delete tests from the GUI.

Target capabilities:

- add page test
- add button click test
- add form submit test
- add API test
- add role/security test
- enable/disable scenario
- group scenarios into suites
- run selected scenarios

## Phase 6 - Risk and Recommendation Engine

Goal:

Turn test results into prioritized product feedback.

Target capabilities:

- risk scoring
- severity classification
- issue grouping
- root-cause hints
- suggested fixes
- launch readiness summary

Example output:

```txt
Risk Score: 72/100
High Risk:
- Login form submit fails on mobile.
- Staff role can access admin billing route.

Recommended fixes:
- Check submit handler in login form.
- Add server-side role guard on billing endpoint.
```

## Phase 7 - Production/SaaS Mode

Goal:

Allow multiple users/projects to use NusaTestLab as a hosted testing platform.

Target capabilities:

- user login
- teams/workspaces
- project management
- scheduled test runs
- history comparison
- notification
- hosted test workers
- billing if commercialized
