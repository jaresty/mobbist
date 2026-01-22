# loop-12 evidence | ADR-0011 | helper:v20251223.1

## loop-12-red | helper:diff-snapshot
- red | 2026-01-22T21:52:20Z | exit 1 | `npm test`
    helper:diff-snapshot=`tests/backend-status.test.js | 7 insertions(+)`
    behaviour ADR-0011 compact popover layout not enforced | inline

```
FAIL  tests/backend-status.test.js > ADR-0011 backend auto-load and drawer > uses a compact popover layout
AssertionError: expected false to be true // Object.is equality
```

## loop-12-green | helper:diff-snapshot
- green | 2026-01-22T21:52:52Z | exit 0 | `npm test`
    helper:diff-snapshot=`index.html | 10 insertions(+), 3 deletions(-); tests/backend-status.test.js | 7 insertions(+)`
    behaviour ADR-0011 compact popover layout applied | inline

## loop-12-removal | helper:diff-snapshot
- removal | 2026-01-22T21:53:29Z | exit 1 | `git restore --source=HEAD -- index.html && npm test`
    helper:diff-snapshot=`tests/backend-status.test.js | 7 insertions(+)`
    behaviour ADR-0011 compact popover layout regresses when implementation is reverted | inline

```
FAIL  tests/backend-status.test.js > ADR-0011 backend auto-load and drawer > uses a compact popover layout
AssertionError: expected false to be true // Object.is equality
```
