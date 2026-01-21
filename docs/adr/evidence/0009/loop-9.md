# loop-9 evidence | ADR-0009 | helper:v20251223.1

## loop-9-red | helper:diff-snapshot
- red | 2026-01-21T18:06:59Z | exit 1 | `npm test`
    helper:diff-snapshot=`tests/backend-status.test.js updated to expect revert-to-local to set reachability offline`
    failure excerpt: `AssertionError: expected 'connected' to be 'offline'` in test "revert to local prevents backend calls on save" | inline
