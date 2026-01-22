# loop-6 evidence | ADR-0011 | helper:v20251223.1

## loop-6-red | helper:diff-snapshot
- red | 2026-01-22T20:55:03Z | exit 1 | `npm test`
    helper:diff-snapshot=`tests/backend-status.test.js | 39 insertions(+)`
    behaviour ADR-0011 URL hash should not be mutated by backend reachability checks | inline

```
FAIL  tests/backend-status.test.js > ADR-0011 backend auto-load and drawer > does not mutate URL hash on backend reachability checks
AssertionError: expected '#/workspace/w1' to be '#/workspace/keep' // Object.is equality
```

## loop-6-green | helper:diff-snapshot
- green | 2026-01-22T20:55:21Z | exit 0 | `npm test`
    helper:diff-snapshot=`index.html | 7 deletions(-); tests/backend-status.test.js | 39 insertions(+)`
    behaviour ADR-0011 URL hash remains stable during backend checks | inline

## loop-6-removal | helper:diff-snapshot
- removal | 2026-01-22T20:55:38Z | exit 1 | `git restore --source=HEAD -- index.html && npm test`
    helper:diff-snapshot=`tests/backend-status.test.js | 39 insertions(+)`
    behaviour ADR-0011 hash-mutation guardrail fails when implementation revert removes no-hash writes | inline

```
FAIL  tests/backend-status.test.js > ADR-0011 backend auto-load and drawer > does not mutate URL hash on backend reachability checks
AssertionError: expected '#/workspace/w1' to be '#/workspace/keep' // Object.is equality
```
