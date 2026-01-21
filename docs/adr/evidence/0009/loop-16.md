# loop-16 evidence | ADR-0009 | helper:v20251223.1

## loop-16-red | helper:diff-snapshot
- red | 2026-01-21T18:42:13Z | exit 1 | `npm test`
    helper:diff-snapshot=`tests/backend-status.test.js expects load/save disabled when backend unreachable; index.html buttons still enabled`
    failure excerpt: `expected false to be true` for disabled state in load/save failure tests | inline
