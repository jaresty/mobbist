# loop-3 evidence | ADR-0011 | helper:v20251223.1

## loop-3-red | helper:diff-snapshot
- red | 2026-01-22T18:44:11Z | exit 1 | `npm test`
    helper:diff-snapshot=`tests/backend-status.test.js | 60 insertions(+)`
    behaviour ADR-0011 autosave/toast expectations fail (missing autosave handler + toast metadata) | inline

```
FAIL  tests/backend-status.test.js > ADR-0011 autosave and toast behaviour > blocks unload when autosave previously failed
TypeError: hooks.setBackendSaveBlocked is not a function

FAIL  tests/backend-status.test.js > ADR-0011 autosave and toast behaviour > marks failure toast as sticky on save failure
AssertionError: expected null not to be null

FAIL  tests/backend-status.test.js > ADR-0011 autosave and toast behaviour > marks success toast as auto-dismiss on save success
AssertionError: expected null not to be null
```

## loop-3-green | helper:diff-snapshot
- green | 2026-01-22T18:46:46Z | exit 0 | `npm test`
    helper:diff-snapshot=`index.html | 85 insertions(+), 4 deletions(-); tests/backend-status.test.js | 60 insertions(+)`
    behaviour ADR-0011 autosave/toast expectations green with handler and toast metadata | inline

## loop-3-removal | helper:diff-snapshot
- removal | 2026-01-22T18:49:42Z | exit 0 | `git restore --source=HEAD -- index.html tests/backend-status.test.js && npm test`
    helper:diff-snapshot=clean
    behaviour ADR-0011 does not re-fail after revert because specifying tests were removed; tightening requires keeping the new tests in place | inline
