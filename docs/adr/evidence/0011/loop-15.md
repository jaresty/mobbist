# loop-15 evidence | ADR-0011 | helper:v20251223.1

## loop-15-red | helper:diff-snapshot
- red | 2026-01-22T22:18:05Z | exit 1 | `npm test`
    helper:diff-snapshot=`tests/backend-status.test.js | 28 insertions(+)`
    behaviour ADR-0011 connect-and-check does not prompt/load existing workspace | inline

```
FAIL  tests/backend-status.test.js > ADR-0011 backend auto-load and drawer > prompts and loads when Connect & Check targets an existing workspace
Error: fetch calls did not reach target
```

## loop-15-green | helper:diff-snapshot
- green | 2026-01-22T22:18:42Z | exit 0 | `npm test`
    helper:diff-snapshot=`index.html | 15 insertions(+), 1 deletion(-); tests/backend-status.test.js | 28 insertions(+)`
    behaviour ADR-0011 connect-and-check prompts and loads existing workspace | inline

## loop-15-removal | helper:diff-snapshot
- removal | 2026-01-22T22:19:00Z | exit 1 | `git show HEAD:index.html > index.html && npm test`
    helper:diff-snapshot=`tests/backend-status.test.js | 28 insertions(+)`
    behaviour ADR-0011 connect-and-check guardrail fails after reverting prompt/load path | inline

```
FAIL  tests/backend-status.test.js > ADR-0011 backend auto-load and drawer > prompts and loads when Connect & Check targets an existing workspace
Error: fetch calls did not reach target
```
