# loop-5 evidence | ADR-0011 | helper:v20251223.1

## loop-5-red | helper:diff-snapshot
- red | 2026-01-22T20:46:51Z | exit 1 | `npm test`
    helper:diff-snapshot=`tests/backend-status.test.js | 32 insertions(+)`
    behaviour ADR-0011 missing workspace prompt/create path unimplemented | inline

```
FAIL  tests/backend-status.test.js > ADR-0011 backend auto-load and drawer > recreates missing workspace when backend returns 404
AssertionError: expected false to be true // Object.is equality
```

## loop-5-green | helper:diff-snapshot
- green | 2026-01-22T20:47:27Z | exit 0 | `npm test`
    helper:diff-snapshot=`index.html | 29 insertions(+); tests/backend-status.test.js | 32 insertions(+)`
    behaviour ADR-0011 recreates missing workspace after 404 with user confirmation | inline

## loop-5-removal | helper:diff-snapshot
- removal | 2026-01-22T20:47:39Z | exit 1 | `git restore --source=HEAD -- index.html && npm test`
    helper:diff-snapshot=`tests/backend-status.test.js | 32 insertions(+)`
    behaviour ADR-0011 recreate flow fails when implementation is reverted but specifying test remains | inline

```
FAIL  tests/backend-status.test.js > ADR-0011 backend auto-load and drawer > recreates missing workspace when backend returns 404
AssertionError: expected false to be true // Object.is equality
```
