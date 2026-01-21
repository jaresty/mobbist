# loop-11 evidence | ADR-0009 | helper:v20251223.1

## loop-11-red | helper:diff-snapshot
- red | 2026-01-21T18:09:59Z | exit 1 | `npm test`
    helper:diff-snapshot=`tests/backend-status.test.js adds failure-handling expectations; index.html not yet updating reachability on errors`
    failure excerpt: `expected 'connected' to be 'offline'` for load/save failure tests | inline
