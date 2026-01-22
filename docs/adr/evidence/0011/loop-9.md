# loop-9 evidence | ADR-0011 | helper:v20251223.1

## loop-9-red | helper:diff-snapshot
- red | 2026-01-22T21:27:28Z | exit 1 | `npm test`
    helper:diff-snapshot=`tests/backend-status.test.js | 12 insertions(+)`
    behaviour ADR-0011 configure action should sit beneath status bar | inline

```
FAIL  tests/backend-status.test.js > ADR-0011 backend auto-load and drawer > places the configure action beneath the status bar
AssertionError: expected null not to be null
```

## loop-9-green | helper:diff-snapshot
- green | 2026-01-22T21:27:47Z | exit 0 | `npm test`
    helper:diff-snapshot=`index.html | 19 insertions(+), 2 deletions(-); tests/backend-status.test.js | 12 insertions(+)`
    behaviour ADR-0011 configure action moved beneath status bar | inline

## loop-9-removal | helper:diff-snapshot
- removal | 2026-01-22T21:28:14Z | exit 1 | `git restore --source=HEAD -- index.html && npm test`
    helper:diff-snapshot=`tests/backend-status.test.js | 12 insertions(+)`
    behaviour ADR-0011 configure placement regresses when implementation is reverted | inline

```
FAIL  tests/backend-status.test.js > ADR-0011 backend auto-load and drawer > places the configure action beneath the status bar
AssertionError: expected null not to be null
```
