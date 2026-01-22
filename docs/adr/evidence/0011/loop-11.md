# loop-11 evidence | ADR-0011 | helper:v20251223.1

## loop-11-red | helper:diff-snapshot
- red | 2026-01-22T21:43:48Z | exit 1 | `npm test`
    helper:diff-snapshot=`index.html | 105 insertions(+), 61 deletions(-); tests/backend-status.test.js | 40 insertions(+), 14 deletions(-)`
    behaviour ADR-0011 backend pill relocation + emoji status unimplemented in tests | inline

```
FAIL  tests/backend-status.test.js > ADR-0009 backend status > shows offline/local fallback when backend is unreachable
AssertionError: expected null not to be null
```

## loop-11-green | helper:diff-snapshot
- green | 2026-01-22T21:44:10Z | exit 0 | `npm test`
    helper:diff-snapshot=`index.html | 105 insertions(+), 61 deletions(-); tests/backend-status.test.js | 40 insertions(+), 14 deletions(-)`
    behaviour ADR-0011 backend pill and popover anchored near header with emoji status | inline

## loop-11-removal | helper:diff-snapshot
- removal | 2026-01-22T21:44:34Z | exit 1 | `git restore --source=HEAD -- index.html && npm test`
    helper:diff-snapshot=`tests/backend-status.test.js | 40 insertions(+), 14 deletions(-)`
    behaviour ADR-0011 backend pill relocation regresses when implementation is reverted | inline

```
FAIL  tests/backend-status.test.js > ADR-0009 backend status > shows offline/local fallback when backend is unreachable
AssertionError: expected undefined to be 'unreachable'
```
