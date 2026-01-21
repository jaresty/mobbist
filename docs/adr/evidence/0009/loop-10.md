# loop-10 evidence | ADR-0009 | helper:v20251223.1

## loop-10-red | helper:diff-snapshot
- red | 2026-01-21T18:07:17Z | exit 1 | `npm test`
    helper:diff-snapshot=`tests/backend-status.test.js expects revert-to-local to set reachability offline; index.html pending fix`
    failure excerpt: `AssertionError: expected 'connected' to be 'offline'` in "revert to local prevents backend calls on save" | inline

## loop-10-green | helper:diff-snapshot
- green | 2026-01-21T18:08:33Z | exit 0 | `npm test`
    helper:diff-snapshot=`index.html updates revertToLocal to mutate config to offline; tests/backend-status.test.js unchanged`
    Vitest/jsdom now passes offline reachability assertion | inline
