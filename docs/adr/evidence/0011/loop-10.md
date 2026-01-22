# loop-10 evidence | ADR-0011 | helper:v20251223.1

## loop-10-red | helper:diff-snapshot
- red | 2026-01-22T21:31:51Z | exit 1 | `npm test`
    helper:diff-snapshot=`tests/backend-status.test.js | 10 insertions(+)`
    behaviour ADR-0011 backend controls should render as a popover | inline

```
FAIL  tests/backend-status.test.js > ADR-0011 backend auto-load and drawer > renders backend controls as a popover
AssertionError: expected false to be true // Object.is equality
```

## loop-10-green | helper:diff-snapshot
- green | 2026-01-22T21:32:47Z | exit 0 | `npm test`
    helper:diff-snapshot=`index.html | 25 insertions(+), 2 deletions(-); tests/backend-status.test.js | 10 insertions(+)`
    behaviour ADR-0011 backend controls now render in a popover container | inline

## loop-10-removal | helper:diff-snapshot
- removal | 2026-01-22T21:33:07Z | exit 1 | `git restore --source=HEAD -- index.html && npm test`
    helper:diff-snapshot=`tests/backend-status.test.js | 10 insertions(+)`
    behaviour ADR-0011 popover styling regresses when implementation is reverted | inline

```
FAIL  tests/backend-status.test.js > ADR-0011 backend auto-load and drawer > renders backend controls as a popover
AssertionError: expected false to be true // Object.is equality
```
