# loop-7 evidence | ADR-0011 | helper:v20251223.1

## loop-7-red | helper:diff-snapshot
- red | 2026-01-22T20:58:48Z | exit 1 | `npm test`
    helper:diff-snapshot=`tests/backend-status.test.js | 10 insertions(+)`
    behaviour ADR-0011 should ignore workspace URL hash on init | inline

```
FAIL  tests/backend-status.test.js > ADR-0011 backend auto-load and drawer > ignores workspace hash hydration on init
AssertionError: expected 'from-url' to be null
```

## loop-7-green | helper:diff-snapshot
- green | 2026-01-22T20:59:01Z | exit 0 | `npm test`
    helper:diff-snapshot=`index.html | 13 deletions(-), 1 insertion(+); tests/backend-status.test.js | 10 insertions(+)`
    behaviour ADR-0011 ignores workspace URL hash on init | inline

## loop-7-removal | helper:diff-snapshot
- removal | 2026-01-22T20:59:13Z | exit 1 | `git restore --source=HEAD -- index.html && npm test`
    helper:diff-snapshot=`tests/backend-status.test.js | 10 insertions(+)`
    behaviour ADR-0011 URL hash hydration returns when implementation is reverted | inline

```
FAIL  tests/backend-status.test.js > ADR-0011 backend auto-load and drawer > ignores workspace hash hydration on init
AssertionError: expected 'from-url' to be null
```
