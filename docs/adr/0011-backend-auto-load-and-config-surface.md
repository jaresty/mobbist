# ADR-0011: Backend Auto-Load and Configuration Surface

- Status: Proposed
- Date: 2026-01-22
- Owners: Mobbist maintainers
- Related:
  - `docs/adr/0009-spa-backend-integration.md`
  - `docs/adr/0010-backend-contract.md`

## Context

The backend is now a core capability, although optional, of the Mobbist workflow, but the current UI treats backend actions as a large, persistent control block. This draws attention away from daily planning actions and makes the layout feel heavy. Additionally, users expect that a configured backend will load automatically on page start without manual "Connect & Check" clicks.

We need a lightweight, always-available backend status signal that avoids distraction while still keeping configuration and maintenance actions discoverable.

## Decision

### 1) Auto-load on startup when backend is configured

On page load:

- For local only, there is nothing backend related to do.
- Only if a backend URL is configured, the SPA immediately performs `GET /capabilities`.
- On success, the SPA loads the backend workspace automatically.
  - If a persisted backend workspace id exists, load it, this only exists if a backend url is configured successfully
  - If no workspace id exists yet, create one with `POST /workspaces`, persist the returned id, then load.
  - If the workspace does not exist, that is an error state, and we should prompt the user if they want to create a new one or disconnect and use local storage.
    - The default option should be to create a new workspace, and use the existing local data.
- If capabilities fails, stay in backend mode but show an unreachable status until the user retries or switches to local-only.

This fulfills the expectation that "configured backend" implies "auto load on startup" without requiring manual user action.

### 2) Backend controls move to a compact, non-distracting surface

Replace the current full-width backend box with a compact status bar plus a configuration drawer:

- A slim status bar shows: `Backend: Connected` or `Backend: Local`, with a single `Configure` link.
- Clicking `Configure` opens a drawer/popover containing all backend controls:
  - Backend URL input, Connect/Retry
  - Load/Save actions
  - Copy backend URL
  - Switch to Local Only
- The drawer is closed by default, because backend is completely optional, until it is configured.
- The drawer is closed by default, except:
  - When backend is unreachable (drawer opened automatically to surface the problem and retry action)
  - The drawer should NOT open by default when no backend URL is configured.
- The status bar remains visible in both local-only and backend modes.
- Backend: Local is not an error state, it is an acceptable state. Neither Success Nor Failure, just Ok. Make sure the UI reflects that condition.

### 3) Daily-use focus and persistent state

- The configuration drawer open/closed state is persisted in local storage.
- The compact status bar never blocks planning actions or controls; it uses a small footprint and fixed placement.
- The page URL should not reflect any backend configuration changes. That should only be managed through the local storage.

### 4) Heartbeat backend connectivity
- a GET to /capabilities should be done on 30 second cadence to ensure connectvity remains up only if a backend is configured.
  - That "heartbeat" should be indicated in the UI so that the user knows they're still able to talk to the backend
  - It should indicate visually when the check is being performed and the result of that check.
  - This is the source of the UI status that indicates whether or not the backend is connected.
  - The earlier mentioned slim status bar, is where in the UI the heartbeat information should be displayed.
- No heartbeat functionality exists when in local-only mode.
- The states Unreachable and Checking should show up distinctly in the UI as well.

### 5) Automatic Saving to the backend
- On page unload, or navigation away, it should automatically save to the backend.
- If backend saving does not succeed, it should not be attempted again until the next heartbeat check passes, and it should prevent the user from unloading the page, or navigating away without a confirmation.
  - If unloading cannot be blocked, only prompt if the save fails and the browser allows a confirmation.
  - If the browser does not allow confirmation, use a best effort sendBeacon attempt to save.

### 6) Backend Saving Notifications
- When the backend is saved, a toast, not an alert, should be displayed to the user that the backend was saved successfully.
- The toast should be small and concise, and auto dismiss when the backend save was successful.
- When the backend save failed for some reason, the toast should not auto-dismiss.
- The same toast can be displayed when the user presses save manually or when auto-save happens.

## Alternatives Considered

- Keep the existing backend panel: Rejected; it dominates the UI and is not part of daily planning.
- Hide backend controls under a general "Advanced" toggle: Rejected; backend setup is required and should be discoverable.
- Always keep the drawer open in backend mode: Rejected; it reintroduces visual noise.

## Consequences

### Positive

- Backend setup remains accessible without competing with core planning controls.
- The app behaves as users expect when a backend URL is configured: auto-connect and auto-load.
- Clear backend status is always visible with minimal UI footprint.

### Negative

- Slightly more UI state to manage (drawer state, first-run behavior).
- Requires careful messaging when auto-load fails to avoid confusion.

## Acceptance Criteria

- When a backend URL is configured, loading the page triggers a capabilities check and auto-loads a backend workspace.
- Backend configuration controls are accessed from a compact status bar via a configuration drawer.
- The drawer defaults to closed in normal operation and opens automatically only for connectivity issues when a url is already configured.
- The status bar UI is updated automatically when the heartbeat fails
- Backend saving notifications show up on save and automatically disappear.
- Backend saving notifications show up on failure, and do not automatically disappear.
- The backend is saved on page unload, or when navigating away, and a failure will prompt the user to confirm.
