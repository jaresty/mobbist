# loop-2 evidence | ADR-0011 | helper:v20251223.1

## loop-2-red | helper:diff-snapshot
- red | 2026-01-22T18:33:55Z | exit 1 | `npm test`
    helper:diff-snapshot=`tests/backend-status.test.js | 105 insertions(+), 20 deletions(-)`
    behaviour ADR-0011 auto-load/drawer expectations fail (drawer state + auto-connect) | inline

```
FAIL  tests/backend-status.test.js > ADR-0011 backend auto-load and drawer > keeps the drawer closed when no backend URL is configured
AssertionError: expected undefined to be 'false'

FAIL  tests/backend-status.test.js > ADR-0011 backend auto-load and drawer > auto-connects and loads from backend on startup
Error: fetch calls did not reach target
```

## loop-2-green | helper:diff-snapshot
- green | 2026-01-22T18:38:10Z | exit 0 | `npm test`
    helper:diff-snapshot=`index.html | 236 insertions(+), 32 deletions(-); tests/backend-status.test.js | 167 insertions(+), 17 deletions(-)`
    behaviour ADR-0011 auto-load/drawer checks green with specifying tests | inline

## loop-2-removal | helper:diff-snapshot
- removal | 2026-01-22T18:40:43Z | exit 0 | `git restore --source=HEAD -- index.html tests/backend-status.test.js && npm test`
    helper:diff-snapshot=clean
    behaviour ADR-0011 does not re-fail after revert because specifying tests were removed; tightening requires keeping the new tests in place | inline
