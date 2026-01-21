# ADR: Pair/Mob Planning Single-Page Tool

- Status: Proposed _(persistence strategy superseded by ADR-0009: Frontend Persistence and Backend Integration Strategy)_
- Date: 2025-12-04
- Owners: Docs app maintainers
- Related:
  - `apps/docs/src/pages/pairs.html`
  - New planner page implemented alongside `pairs.html` (route TBD)

## Context

Teams need a lightweight way to plan pair/mob rotations without introducing new backend services or external tools. The existing `src/pages/pairs.html` in the docs app demonstrates a simple, self-contained UI pattern suitable for this type of internal planning.

We want to:

- Support a configurable list of “people”.
- Support multiple “tracks” representing current assignments.
- Persist state locally in the browser.
- Provide quick ways to reshuffle people between tracks with minimal clicks.
- Keep complexity low (no backend, no authentication, no cross-device sync).
- Keep the existing `pairs.html` page intact and add this planner as a **parallel** single page, not a replacement.

## Decision

We will build a **single-page, client-only Pair/Mob Planning Tool**, implemented as a new route in the docs app **alongside** (and not replacing) `src/pages/pairs.html`, that:

- Uses **Local Storage** as its persistence layer.
- Manages a set of **tracks** (columns) to which **people** can be assigned.
- Treats **“Out of Office”** and **“On Deck”** as **special tracks** with custom behaviors.
- Supports **drag-and-drop**, **sweep**, and **shuffle** actions to move people between tracks.
- Stores all configuration and assignments in a single structured object in Local Storage keyed by a stable namespace (for example, `pairPlanner:v1`).

The page will follow the structure and implementation style of `src/pages/pairs.html` (simple, dependency-light, single-page structure with inline or minimal JS), but adapted for the behaviors below.

## Details

### Data Model

We will persist a single object in Local Storage:

- `people: Person[]`
  - `id: string` (stable identifier)
  - `name: string`
- `tracks: Track[]`
  - `id: string`
  - `name: string`
  - `capacity: number | null` (null/unset = unlimited)
  - `type: "normal" | "out_of_office" | "on_deck"` (only one of each special type)
  - `personIds: string[]` (ordered list of people assigned to this track)

Derived invariants:

- Every `person.id` appears in **exactly one** track’s `personIds`.
- Exactly one `on_deck` track and one `out_of_office` track exist at any given time.

### Tracks

- **On Deck (special)**
  - Source of unassigned/available people.
  - Has a **“Sweep & Allocate”** button:
    - Randomly allocates people from `on_deck` into all **normal** tracks (excluding the `out_of_office` track), respecting each track’s capacity.
    - Any overflow remains on deck.
- **Out of Office (special)**
  - Holds people temporarily unavailable.
  - Excluded from all sweep/allocation operations.
- **Normal tracks**
  - User-named.
  - Have adjustable **capacity**:
    - Capacity defines the max number of people allowed.
    - Capacity changes are validated to avoid exceeding capacity; if capacity is reduced below current occupancy, the UI will either:
      - Prevent saving the new capacity, or
      - Prompt to sweep excess people back to `on_deck` (implementation detail to finalize in UI).
  - Can be **deleted**:
    - Deleting a track moves all its `personIds` back to the `on_deck` track (preserving those people).

### Interactions

#### Moving People

- **Drag-and-drop**:
  - People can be dragged between tracks.
  - Dropping into a track:
    - Is allowed only if that track has capacity (or unlimited).
    - If not allowed, the UI will reject the drop with a visible cue.
- **Per-person controls**:
  - **Sweep person**:
    - Moves that person directly to `on_deck` regardless of current track.
  - **Shuffle person**:
    - Randomly selects another track (excluding the current track, `out_of_office`, and any full tracks) and moves the person there if possible.
    - If no eligible track has capacity, shuffle is a no-op (with a small UI indication).

#### Track Controls

- **Sweep track**
  - For any track (including `on_deck`, but handled specially — see below):
  - Chooses **one random person** currently in that track to remain.
  - Moves all other people from the track to the `on_deck` track.
- **Delete track**
  - Only for normal tracks.
  - Moves all assigned people to `on_deck`.
  - Removes the track from the model.

#### On Deck “Sweep & Allocate”

- On `on_deck`, the primary control is **“Sweep & Allocate”**:
  - Iterates over all **normal** tracks in a stable order (for example, track creation order).
  - Fills each track randomly from `on_deck` until:
    - The track reaches capacity, or
    - `on_deck` is empty.
  - Does **not** touch the `out_of_office` track.
  - Leaves any unallocated people in `on_deck`.

## Persistence & Reset

- All changes (drag, sweep, shuffle, capacity change, rename, track creation/deletion) update the in-memory model and immediately persist to Local Storage.
- Provide a **“Reset plan”** control that:
  - Clears Local Storage for this tool’s key.
  - Rebuilds a default state:
    - People list (either empty or seeded via a simple form/import).
    - Default tracks: `On Deck`, `Out of Office`, and at least one normal track (for example, “Track A”).

## Alternatives Considered

- **Backend service / shared storage**
  - Rejected for now due to higher complexity, auth requirements, and infra work.
  - Local Storage is sufficient for personal/team-station usage.
- **Multi-page or routed experience**
  - Rejected in favor of a single-page tool for speed and simplicity.
- **External tool integration (Miro, Jira plugins, etc.)**
  - Rejected to avoid external dependencies and keep workflow embedded in our internal tooling.

## Consequences

**Pros**

- Simple, fast, no-backend implementation using patterns already used in `src/pages/pairs.html`.
- Highly interactive pairing/mobbing workflow optimized for keyboard and mouse.
- Stateful across reloads in a given browser via Local Storage.
- Leaves the existing `pairs.html` experience untouched while adding a more capable planner alongside it.

**Cons / Risks**

- State is **per-browser, per-device**; no built-in sharing/sync.
- Local Storage can be cleared by the user or IT policies.
- Drag-and-drop and randomization must be carefully designed for accessibility and discoverability.

## Follow-Ups

- Choose a concrete route/name for the new planner page (for example, `src/pages/pair-planner.html`) and scaffold it in the docs app alongside `src/pages/pairs.html`.
- Implement the behaviors described above, using `pairs.html` as a structural reference but keeping the two pages independent.
- Add minimal documentation in `apps/docs/README.md` describing:
  - The data model.
  - Supported interactions (sweep/shuffle/allocate).
- Consider future enhancements:
  - Export/import JSON for sharing plans.
  - Optional URL-based encoding for shareable states.
