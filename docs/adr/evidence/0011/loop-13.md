# loop-13 evidence | ADR-0011 | helper:v20251223.1

## loop-13-manual-smoke | helper:timestamp
- manual | 2026-01-22T21:58:21Z | backend=http://localhost:6967 | chrome-mcp
    scenario: connect backend, create workspace, save state, reload from backend
    steps:
      1) Opened `index.html` and entered `http://localhost:6967` in backend URL.
      2) Clicked Connect & Check; status showed "Backend: Connected 🟢".
      3) Added person "Smoke User" and clicked "Save to Backend"; toast "Backend saved." displayed.
      4) Clicked "Reset plan", then "Load from Backend"; accepted confirm; "Smoke User" restored.
    observations:
      - Backend status reached Connected and heartbeat reported connected.
      - Save succeeded and toast appeared.
      - Load restored server state after reset.
