# loop-5 evidence | ADR-0009 | helper:v20251223.1

## loop-5-green | helper:diff-snapshot
- green | 2026-01-21T17:52:00Z | exit 0 | `node scripts/validate-backend-status.js`
    helper:diff-snapshot=`index.html | backend status UI/hooks present; package.json/package-lock.json added; scripts/validate-backend-status.js rewritten for jsdom; docs/adr/0009-spa-backend-integration.work-log.md updated`
    jsdom-backed validation confirms badge shows offline/local fallback when fetch fails | inline
