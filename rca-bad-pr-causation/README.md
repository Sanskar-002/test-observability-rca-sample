# RCA "Bad PR Causation" — Test Data

Sample artifacts for exercising BrowserStack Test Observability's **Bad PR Causation** RCA. The RCA classifies a failing test as caused by either:

- **Bad Dev PR** — the app under test changed in a way that broke the test.
- **Bad Automation PR** — the test code itself changed in a way that broke it.

This sample gives the RCA a clean, controlled training/evaluation signal for each verdict, plus a way to demo it end-to-end.

## Layout

```
rca-bad-pr-causation/
├── app/
│   └── bad-pr-causation-tests.html   # The "app". Hosted via GitHub Pages.
├── specs/
│   └── bad-pr-causation.spec.js      # 6 simple WDIO/Mocha tests against the app.
├── docs/
│   └── bad-pr-causation-dev-pr.md    # The exact diffs that each regression branch applies.
├── wdio.conf.js                      # Self-contained WDIO config (BrowserStack + Test Observability).
├── package.json
└── .nojekyll                         # Tells GitHub Pages to serve all files as-is.
```

## Live App URL

Hosted on Netlify (single-file deploy of `app/bad-pr-causation-tests.html`):

```
https://tranquil-custard-21c4b2.netlify.app/
```

Override at runtime with `RCA_APP_URL` if testing a preview deploy.

## Local install + run

```bash
cd rca-bad-pr-causation
npm install
export BROWSERSTACK_USERNAME=...
export BROWSERSTACK_ACCESS_KEY=...
npm test
```

Against the unchanged `main`, all 6 tests should **pass**.

## Running against preprod / regression

Switch envs by changing `PROFILE` in the command — same pattern as
`BStackAutomation/observability/api/src/__tests__/aiRca.test.js` (which is
driven by `PROFILE=preprod|regression|prod` selecting `configs/{PROFILE}.js`).

| Command | Hub | Credential env vars |
|---|---|---|
| `PROFILE=prod npm test` (default) | `hub-cloud.browserstack.com` | `BROWSERSTACK_USERNAME` / `BROWSERSTACK_ACCESS_KEY` |
| `PROFILE=preprod npm test` | `hub-preprod.bsstag.com` | `BROWSERSTACK_PREPROD_USERNAME` / `BROWSERSTACK_PREPROD_ACCESS_KEY` (falls back to prod creds) |
| `PROFILE=regression npm test` | `hub-k8s.bsstag.com` | `BROWSERSTACK_REGRESSION_USERNAME` / `BROWSERSTACK_REGRESSION_ACCESS_KEY` (falls back to prod creds) |

Shortcuts: `npm run test:preprod`, `npm run test:regression`. The selected
hub + profile are echoed in the WDIO `before` hook so the build output makes
the env unambiguous.

## Regression branches

Two demonstration branches live alongside `main`. Each branch contains exactly one class of fault, so the RCA verdict per branch is unambiguous.

| Branch | Diff vs `main` | Expected RCA verdict |
|---|---|---|
| `regression/bad-dev-pr` | `app/bad-pr-causation-tests.html` only — element ids renamed, on-page text changed. | **Bad Dev PR** |
| `regression/bad-automation-pr` | `specs/bad-pr-causation.spec.js` only — wrong selectors, wrong expected text, typos. | **Bad Automation PR** |

In both cases all 6 tests fail. The full per-test failure shape and the per-edit reason live in [`docs/bad-pr-causation-dev-pr.md`](docs/bad-pr-causation-dev-pr.md).

## Demo workflow

1. Open a PR from `regression/bad-dev-pr` → `main`. BrowserStack picks up the App diff.
2. Run `npm test` against the PR; observe 6 failures.
3. Confirm the RCA marks every failure as **Bad Dev PR**.
4. Close that PR. Repeat with `regression/bad-automation-pr` → `main`.
5. Confirm the RCA marks every failure as **Bad Automation PR**.

## Notes

- The app is intentionally minimal — login, banner, profile, cart, submit, logout — so failures are easy to reason about and the diff between branches is small.
- The spec uses unconditional assertions (no thread / env branching) so the failure signal is 100% attributable to the PR diff.
- `wdio.conf.js` runs against BrowserStack Automate + Test Observability under the project name `Test Observability Samples`.
