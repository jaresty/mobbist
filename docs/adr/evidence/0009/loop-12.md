# loop-12 evidence | ADR-0009 | helper:v20251223.1

## loop-12-green | helper:diff-snapshot
- green | 2026-01-21T18:10:22Z | exit 0 | `npm test`
    helper:diff-snapshot=`index.html updates reachability to offline on load/save failures; tests/backend-status.test.js adds failure expectations`
    Vitest/jsdom covers offline status, load/save success, revert-to-local, dirty-load confirm, and failure-to-offline behaviour | inline
