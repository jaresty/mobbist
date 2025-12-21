# ADR: Roles Entity for Track Allocation

- Status: Proposed
- Date: 2025-12-20
- Owners: Docs app maintainers
- Related:
  - `docs/adr/0001-pair-mob-planning-tool.md`
  - `docs/adr/0002-drag-to-create-track.md`
  - `docs/adr/0003-undo-redo-history.md`

## Context

Facilitators frequently manage responsibilities such as "driver," "navigator," or "scribe" alongside the people rotating through tracks. Representing these duties by duplicating people or relying on ad-hoc notes introduces friction when shuffling the roster. The existing planner distinguishes people, tracks, and special tracks ("On Deck" and "Out of Office"), but has no dedicated concept for reusable roles that can follow a track regardless of who is assigned there.

Teams have asked for a way to persist and reshuffle named roles just as easily as people, while keeping them visually distinct and constrained to active tracks. We need an approach that preserves drag-and-drop fluency, keeps special tracks person-only, and aligns with the undo/redo and persistence patterns already in place.

## Decision

Introduce **roles** as a first-class entity that can be allocated to normal tracks and shuffled independently of people. The planner will:

- Maintain a `roles` collection stored alongside people in Local Storage.
- Allow each track to own an ordered list of role IDs separate from its people list.
- Provide a top-level **"Shuffle Roles"** control that randomly reallocates roles among the currently visible normal tracks.
- Make roles editable (rename, delete) and individually shuffleable via per-role controls, mirroring people interactions but respecting the track-only constraint.
- Render roles distinctly from people, reinforcing that they cannot be moved to "On Deck" or "Out of Office" and do not count against track capacity.

## Details

### Data Model

Augment the stored planner state with roles:

- `roles: Role[]`
  - `id: string`
  - `name: string`
  - `color: string | null` (optional accent for differentiation; null defers to default styling)
- Update `tracks: Track[]` to include `roleIds: string[]` representing the ordered roles assigned to that track.

Invariants:

- Every `role.id` appears in **exactly one** track `roleIds` array or remains unassigned in a dedicated `unplacedRoleIds` list (initially empty). Roles never appear in `on_deck` or `out_of_office` special tracks.
- Special tracks continue to track only people; their `roleIds` arrays remain empty.
- Role identifiers remain stable across rename, shuffle, and undo/redo operations.

A migration step initializes `roleIds` on existing tracks to an empty array and seeds `roles: []` for legacy data.

### UI Surface

- Roles display within each track beneath the people list, using a compact pill treatment and the optional accent color.
- Drag handles and affordances mirror people, but drop targets are limited to normal tracks.
- Special tracks label the roles area as unavailable to clarify that roles cannot be placed there.
- Track headers expose a combined management menu for people and roles, with separate counts to avoid confusion.
- A primary "Add Role" button lives alongside "Shuffle Roles" in the page header, with a secondary entry in the command palette for keyboard parity.

### Interactions

- **Create Role:** The "Add Role" button prompts for a name (and optional color) before placing the new role in a designated track (defaulting to the first normal track) or letting the facilitator choose a destination.
- **Assign/Move Role:** Drag-and-drop or command palette moves roles between normal tracks. Dropping into a full track is always allowed because roles do not consume capacity.
- **Rename Role:** Inline rename dialog updates the `name` field and persists immediately.
- **Delete Role:** Removes the role from the owning track and the `roles` collection; undo restores both placement and metadata.
- **Shuffle Role (per-role):** Randomly selects a different normal track (excluding the current one) and reassigns the role if at least one eligible target exists.
- **Shuffle Roles (global):** Iterates over all roles and redistributes them randomly across normal tracks, ensuring each role ends up in exactly one track. Optionally maintain track-local ordering by shuffling within each destination track after assignment.
- **Undo/Redo:** Treat role operations as discrete actions consistent with ADR 0003, preserving combined drag-and-drop + creation/deletion sequences.

### Persistence & Reset

- All role operations update the shared Local Storage payload (`pairPlanner:v1`) in the same transaction model as people changes.
- `Reset plan` clears roles alongside people and restores default tracks with empty `roleIds` arrays.
- Export/import features (future work) must include roles and their placement.

## Alternatives Considered

- **Represent roles as tags on tracks or people.** Rejected because tags cannot be shuffled independently and would complicate undo granularity.
- **Treat roles as special people records.** Rejected to avoid confusion in capacity counts, special track behaviors, and visual presentation.
- **Allow roles in On Deck / Out of Office.** Rejected to keep those tracks focused on availability of people and avoid intermixing duties with attendance states.

## Consequences

**Pros**

- Clarifies responsibility rotation without duplicating people or relying on manual notes.
- Keeps role management consistent with existing shuffle and undo patterns.
- Maintains visual separation between who is on a track and what role the track is currently fulfilling.

**Cons / Risks**

- Increases model complexity and storage footprint.
- Requires updated drag-and-drop accessibility messaging and testing for the new entity type.
- Adds another global control that must be differentiated from existing shuffle actions to prevent mis-clicks.

## Follow-Ups

- Implement Local Storage migration to add `roles` and `roleIds` while preserving existing plans.
- Update the planner UI to render roles, expose per-role controls, and add the top-level "Shuffle Roles" button.
- Extend undo/redo tests to cover role creation, rename, shuffle, and deletion flows.
- Document role usage and constraints in the planner help content and onboarding copy.
