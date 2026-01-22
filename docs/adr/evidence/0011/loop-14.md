# loop-14 evidence | ADR-0011 | helper:v20251223.1

## loop-14-red | helper:diff-snapshot
- red | 2026-01-22T21:58:21Z | exit 1 | `npm test`
    helper:diff-snapshot=`tests/backend-status.test.js | 19 insertions(+)`
    behaviour ADR-0011 heartbeat cadence not enforced by tests | inline

```
FAIL  tests/backend-status.test.js > ADR-0011 backend auto-load and drawer > runs heartbeat on the configured cadence
AssertionError: expected "vi.fn()" to be called with arguments: [ …(2) ]
Number of calls: 0
```

## loop-14-green | helper:diff-snapshot
- green | 2026-01-22T22:02:11Z | exit 0 | `npm test`
    helper:diff-snapshot=`index.html | 2 insertions(+); tests/backend-status.test.js | 19 insertions(+)`
    behaviour ADR-0011 heartbeat cadence enforced with fake timers | inline

## loop-14-removal | helper:diff-snapshot
- removal | 2026-01-22T22:03:32Z | exit 1 | `git restore --source=HEAD -- index.html && npm test`
    helper:diff-snapshot=`tests/backend-status.test.js | 19 insertions(+)`
    behaviour ADR-0011 cadence guardrail fails when start/stop heartbeat helpers are removed | inline

```
FAIL  tests/backend-status.test.js > ADR-0011 backend auto-load and drawer > runs heartbeat on the configured cadence
TypeError: hooks.startBackendHeartbeat is not a function
```
