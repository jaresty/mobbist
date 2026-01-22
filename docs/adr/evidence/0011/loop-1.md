# loop-1 evidence | ADR-0011 | helper:v20251223.1

## loop-1-red | helper:diff-snapshot
- red | 2026-01-22T18:18:17Z | exit 1 | `node scripts/validate-adr-0011.js`
    helper:diff-snapshot=clean
    behaviour ADR-0011 auto-load/config-surface lacks validation harness; script missing | inline

```
node:internal/modules/cjs/loader:1424
  throw err;
  ^

Error: Cannot find module '/Volumes/UserStorage/TKA14MZ/gitwork/hackathons/mobbist/scripts/validate-adr-0011.js'
    at Module._resolveFilename (node:internal/modules/cjs/loader:1421:15)
    at defaultResolveImpl (node:internal/modules/cjs/loader:1059:19)
    at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1064:22)
    at Module._load (node:internal/modules/cjs/loader:1227:37)
    at TracingChannel.traceSync (node:diagnostics_channel:328:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:245:24)
    at Module.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:154:5)
    at node:internal/main/run_main_module:33:47 {
  code: 'MODULE_NOT_FOUND',
  requireStack: []
}

Node.js v24.13.0
```
