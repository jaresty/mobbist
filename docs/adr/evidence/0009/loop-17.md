# loop-17 evidence | ADR-0009 | helper:v20251223.1

## loop-17-red | helper:diff-snapshot
- red | 2026-01-21T18:42:45Z | exit 1 | `npm test`
    helper:diff-snapshot=`index.html added disableBackendButtons calls; function declared after usage; buttons not disabled in tests`
    failure excerpt: `ReferenceError: disableBackendButtons is not defined` across backend status tests | inline
