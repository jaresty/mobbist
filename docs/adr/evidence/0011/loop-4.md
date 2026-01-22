# loop-4 evidence | ADR-0011 | helper:v20251223.1

## loop-4-red | helper:diff-snapshot
- red | 2026-01-22T20:26:25Z | exit 1 | `npm test`
    helper:diff-snapshot=`tests/backend-status.test.js | 28 insertions(+)`
    behaviour ADR-0011 manual save should remain blocked until heartbeat succeeds | inline

```
FAIL  tests/backend-status.test.js > ADR-0011 autosave and toast behaviour > blocks manual save until heartbeat clears the save block
AssertionError: expected "vi.fn()" to not be called at all, but actually been called 1 times
```

## loop-4-green | helper:diff-snapshot
- green | 2026-01-22T20:26:55Z | exit 0 | `npm test`
    helper:diff-snapshot=`index.html | 11 insertions(+), 1 deletion(-); tests/backend-status.test.js | 28 insertions(+)`
    behaviour ADR-0011 manual save blocked until heartbeat succeeds | inline

## loop-4-removal | helper:diff-snapshot
- removal | 2026-01-22T20:28:25Z | exit 0 | `git restore --source=HEAD -- index.html tests/backend-status.test.js && npm test`
    helper:diff-snapshot=clean
    behaviour ADR-0011 no longer re-fails after revert because specifying test was removed; keep the test to enforce the guardrail | inline
