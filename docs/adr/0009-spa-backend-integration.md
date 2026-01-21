# ADR-0009: Frontend Persistence and Backend Integration Strategy

- Status: Accepted (Complete; supersedes persistence strategy portions of ADR-001; ADR-001 remains for unrelated scope)
- Date: 2026-01-21
- Owners: Mobbist maintainers
- Related:
  - `index.html`

## Context

The Mobbist application is a single-page application (SPA) implemented as static HTML and JavaScript, with no build or compilation step. Historically, all application data has been persisted locally using localStorage.

A backend service is being introduced to enable persistence, sharing, and cross-device access. However, the backend must remain optional: the application must continue to function fully without it.

Earlier design options considered hybrid or background synchronization models. These approaches were rejected due to complexity, unclear authority, and difficult failure modes.

The team has decided to adopt a strict backend-authoritative model when a backend is configured and reachable, while preserving local-only operation as a fallback.

## Decision

The frontend will treat the backend as the authoritative source of truth whenever it is configured and reachable.

Specifically:

- When a backend is configured and reachable, the SPA loads data from the backend and replaces local state.
- Local storage is treated as a cache and offline fallback, not as a peer source of truth.
- When a backend is configured and not reachable, remote operations fail fast; the SPA does **not** fall back to local unless the user explicitly chooses “Revert to Local.”
- No hybrid merge or background synchronization is implemented.
- All backend interactions are explicit or lifecycle-triggered.
- Conflicts are resolved using last-write-wins semantics.
- There is no authentication.

This decision prioritizes a simple mental model, predictable behavior, and safe degradation.

## Backend Configuration and Reachability

A backend is considered configured if a backend URL is present in persisted frontend settings.

On application startup, the SPA calls `GET /capabilities`:

- If the request succeeds, the backend is considered reachable and strict backend-authoritative mode is active.
- If it fails, the backend remains configured but is marked unreachable; operations fail fast until the user either retries or explicitly “Revert to Local.”

Reachability may change during runtime; the SPA adapts dynamically without automatically entering local mode.

## Load Behavior

### Strict Backend-Authoritative Mode

When the backend is configured and reachable:

- Opening a workspace automatically loads the backend snapshot via `GET /workspaces/:id`.
- The backend snapshot replaces the local state for that workspace.
- Local storage is updated to reflect the loaded snapshot.

To avoid silent data loss:

- The SPA tracks whether local edits have been made since the last successful server load.
- If a server reload would discard local edits, the SPA shows a minimal confirmation dialog: “Reloading from server will discard local changes.”
- If no local edits exist, no confirmation is shown.
- There is no option to keep local data over server data while in strict mode.

### Local Fallback Mode

When the backend is not reachable **and remains configured**:

- Remote operations fail fast; the SPA stays in backend-authoritative mode.
- A visible indicator communicates unreachable state; backend-dependent features remain disabled until connectivity returns.
- The user may choose “Revert to Local” to enter local-only mode; no automatic fallback occurs.

## Save Behavior

Saving follows last-write-wins semantics.

- If the workspace already exists on the backend:
  - The SPA uses `PUT /workspaces/:id` to overwrite the server snapshot.
- If the workspace exists only locally:
  - The SPA uses `POST /workspaces` to create it on the backend.
  - The backend assigns a persistent identifier (SQID).
  - The SPA atomically remaps the local ephemeral identifier to the server-assigned identifier across all local state.
- Optional user confirmation may be shown before overwriting server state.
- No version checks or conflict responses are required from the backend.

## API Contract (frontend-facing)

- `GET /capabilities` → `{ supportsShare: boolean }`
  - 200 = reachable; any non-2xx = unreachable.
- `GET /workspaces/:id` → `{ id: string, name: string, data: <planner-json>, updatedAt: string }`
  - 200 returns the workspace snapshot.
  - 404 treated as unreachable for that workspace; falls back to local.
- `PUT /workspaces/:id` body `{ id: string, name: string, data: <planner-json>, updatedAt: string }`
  - 200 overwrites; last-write-wins; no ETags expected.
- `POST /workspaces` body `{ clientTempId: string, name: string, data: <planner-json> }`
  - 201 returns `{ id: string /*SQID*/, name: string, data: <planner-json>, updatedAt: string }`.
  - `clientTempId` is idempotent to prevent duplicates.
- `POST /workspaces/:id/share` — removed (see Save & Share); backend tokens/links are out of scope.

Errors: non-2xx responses surface as failure states; the UI falls back to local mode when capability check or workspace load fails.

## Identifier Strategy

- Persistent workspace identifiers (SQIDs) are generated by the backend.
- The frontend never generates SQIDs.
- Locally created workspaces use ephemeral local identifiers until persisted.
- On first successful save to the backend, ephemeral identifiers are replaced with SQIDs.

To avoid duplicate workspace creation:

- `POST /workspaces` includes a `clientTempId`.
- The backend treats `clientTempId` idempotently.

## Save & Share

- Markdown import/export remains unchanged and always available.
- Backend access is user-specified; users paste or type the backend URL they intend to use.
- No backend-generated share URLs are provided by the frontend.
- A “Copy backend URL” control is exposed so users can quickly hand the configured backend URL to teammates (e.g., via Slack) for coordination.

## Revert to Local

The SPA provides an explicit Revert to Local action.

Invoking this action:

- Disables backend usage immediately.
- Cancels pending backend requests.
- Preserves the current local state.
- Switches the application into local-only mode atomically.

This is preferred over manually deleting or editing the backend URL, as it is explicit, safe, and reversible.

## User Interface Implications

The frontend UI must:

- Indicate backend connection status (connected vs local fallback).
- Clearly show whether a workspace is local-only or persisted.
- Provide minimal confirmations for destructive operations.
- Disable backend-dependent actions when operating locally.
- No implicit background sync indicators or controls are required.
- Provide a “Revert to Local” control in Settings with confirmation; this clears the backend session, cancels pending requests, and keeps current local state.
- Show backend status (connected vs fallback) via a small badge or banner; disable or explain backend-only actions when offline.
- On potential overwrite (local edits since last server load), show the minimal confirmation “Reloading from server will discard local changes.”

## Out of Scope

The following are explicitly out of scope for this ADR:

- Authentication or authorization
- Background synchronization or polling
- Conflict resolution beyond last-write-wins
- Real-time collaboration
- Fine-grained merge strategies

## Consequences

### Positive

- Clear authority model with minimal ambiguity
- Simple implementation and mental model
- Backend failures cannot brick the application
- Offline usage remains fully supported
- Incremental backend rollout is safe

### Negative

- Local edits may be overwritten by server data
- No automatic conflict detection between devices
- Users may need to rely on confirmations to avoid accidental overwrites

These trade-offs are intentional and accepted.

## Acceptance Criteria

- With backend configured and reachable, opening a workspace loads data from the backend automatically.
- Saving overwrites backend state.
- Local-only workspaces can be persisted explicitly.
- Save & Share produces a share URL when backend is available.
- When the backend is unreachable, the application operates from local storage with clear indication.
- Markdown import/export works regardless of backend configuration.
