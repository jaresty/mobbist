# loop-21 evidence | ADR-0009 | helper:v20251223.1

## loop-21-red | helper:diff-snapshot
- red | 2026-01-21T18:21:34Z | exit 1 | `npm test`
    helper:diff-snapshot=`index.html parseBackendUrl introduced invalid regex/backslash usage; tests failed with SyntaxError`
    failure excerpt: `SyntaxError: Invalid regular expression flags` and `test hooks not exposed` | inline

## loop-21-green | helper:diff-snapshot
- green | 2026-01-21T18:22:11Z | exit 0 | `npm test`
    helper:diff-snapshot=`index.html parseBackendUrl rewritten with URL parsing; load/save use workspaceMeta or embedded id; tests pass (8)`
    All backend status tests green after fix | inline
