# loop-8 evidence | ADR-0011 | helper:v20251223.1

## loop-8-red | helper:diff-snapshot
- red | 2026-01-22T21:03:02Z | exit 1 | `npm test`
    helper:diff-snapshot=`tests/backend-status.test.js | 38 insertions(+)`
    behaviour ADR-0011 heartbeat copy should label checking/connected/unreachable distinctly | inline

```
FAIL  tests/backend-status.test.js > ADR-0011 backend auto-load and drawer > shows heartbeat checking and connected states distinctly
AssertionError: expected 'Checking...' to be 'Heartbeat: Checking' // Object.is equality

FAIL  tests/backend-status.test.js > ADR-0011 backend auto-load and drawer > shows heartbeat unreachable state after failed check
AssertionError: expected 'Heartbeat: unreachable' to be 'Heartbeat: Unreachable' // Object.is equality
```

## loop-8-green | helper:diff-snapshot
- green | 2026-01-22T21:03:20Z | exit 0 | `npm test`
    helper:diff-snapshot=`index.html | 6 insertions(+), 3 deletions(-); tests/backend-status.test.js | 38 insertions(+)`
    behaviour ADR-0011 heartbeat labels are explicit across states | inline

## loop-8-removal | helper:diff-snapshot
- removal | 2026-01-22T21:03:36Z | exit 1 | `git restore --source=HEAD -- index.html && npm test`
    helper:diff-snapshot=`tests/backend-status.test.js | 38 insertions(+)`
    behaviour ADR-0011 heartbeat copy regresses when implementation is reverted | inline

```
FAIL  tests/backend-status.test.js > ADR-0011 backend auto-load and drawer > shows heartbeat checking and connected states distinctly
AssertionError: expected 'Checking...' to be 'Heartbeat: Checking' // Object.is equality

FAIL  tests/backend-status.test.js > ADR-0011 backend auto-load and drawer > shows heartbeat unreachable state after failed check
AssertionError: expected 'Heartbeat: unreachable' to be 'Heartbeat: Unreachable' // Object.is equality
```
