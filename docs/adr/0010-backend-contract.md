# ADR-0010: Backend Contract for Mobbist SPA

- Status: Proposed
- Date: 2026-01-21
- Owners: Backend/SPA maintainers
- Related:
  - `docs/adr/0009-spa-backend-integration.md`

## Context

The frontend (ADR-0009) treats the backend as optional but authoritative when reachable. This ADR defines the minimal backend contract to support load/save while keeping the SPA deployable as static HTML. No share URLs are required; users share the backend URL directly.

## Decision

Provide a simple, unauthenticated JSON API with capability discovery and workspace CRUD. Backend reachability drives the SPA’s authoritative mode. When a backend is configured, the frontend does not auto-fallback to local; failures surface to the user until they explicitly choose local-only. All endpoints are idempotent where applicable and avoid version/ETag semantics (last-write-wins).

## API Surface

### GET /capabilities
- Response 200: `{ supportsWorkspaces: true }`
- Any non-2xx → treated as unreachable.

### GET /workspaces/:id
- Response 200: `{ id: string, name: string, data: <planner-json>, updatedAt: string }`
- Response 404: workspace not found (frontend falls back to local).
- Other non-2xx: treated as unreachable/offline.

### PUT /workspaces/:id
- Request: `{ id: string, name: string, data: <planner-json>, updatedAt?: string }`
- Response 200: same shape as GET.
- Semantics: overwrite (last-write-wins); no version checks required.

### POST /workspaces
- Request: `{ clientTempId: string, name: string, data: <planner-json> }`
- Response 201: `{ id: string /*SQID*/, name: string, data: <planner-json>, updatedAt: string }`
- Semantics: idempotent on `clientTempId` to prevent duplicate creation.

### Error Handling
- 401/403 not expected (no auth).
- 409/412 not used (no merge semantics).
- 5xx/timeout treated as unreachable; frontend surfaces failure and stays in backend mode unless the user explicitly chooses local-only.

## Non-Goals
- Authentication/authorization.
- Share URL/token issuance (frontend users share backend URL manually; see ADR-0009).
- Real-time collaboration or background sync.
- Conflict resolution beyond last-write-wins.

## Consequences
- Keeps contract small and easy to stub/mock for frontend development.
- Backend remains authoritative when configured; users decide when to switch to local-only.
- Future expansion (auth, share tokens, collaboration) requires a separate ADR.
