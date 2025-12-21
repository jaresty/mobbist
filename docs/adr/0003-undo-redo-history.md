# ADR: Global Undo/Redo Instead of Confirmation Modals

- Status: Accepted
- Date: 2025-12-20
- Owners: Docs app maintainers
- Related:
  - `docs/adr/0001-pair-mob-planning-tool.md`
  - `docs/adr/0002-drag-to-create-track.md`
  - `apps/docs/src/pages/pair-planner.html`

## Context

Destructive actions in the Pair/Mob Planning tool currently rely on blocking confirmation dialogs (for example, deleting a track requires an "Are you sure?" step). These interruptions slow down facilitators, especially when iterating quickly, and they fail to protect against mistakes made through non-destructive actions (like an accidental shuffle). Confirmation dialogs also create an inconsistent experience: some actions prompt, others do not, and the dialogs depend on the browser's rendering quality.

Modern productivity tools increasingly prefer optimistic actions coupled with global undo/redo controls. This approach keeps the interface snappy, gives users confidence that missteps are reversible, and avoids modal interruptions. Because the planner stores state only locally, we can provide a session-scoped history model without backend dependencies.

## Decision

Replace confirmation dialogs for destructive actions with a global undo/redo system that captures the most recent operations. Provide persistent "Undo" and "Redo" affordances in the UI (and via keyboard shortcuts) that apply to the last action taken. The history stack lives entirely client-side and resets on page reload.

## Details

- **Scope of undoable actions**
  - Covers all user-initiated operations that mutate planner state, including: creating/deleting/renaming tracks, changing capacities, moving people (drag/drop, sweep, shuffle), editing people, and bulk operations such as "Sweep & Allocate".
  - Treats multi-step flows as a single entry—for example, the drop-to-create-new-track flow adds one history item that both creates the track and places the person.
  - Non-mutating UI toggles (e.g., opening menus) are excluded.
- **History model**
  - Maintains two stacks: `undoStack` and `redoStack` capped at a reasonable length (e.g., 30 entries) to limit memory usage while covering practical session workflows.
  - Each entry stores the minimal data required to restore the prior state; for simplicity and determinism we will snapshot the full planner state object per entry until performance testing proves we need a diff-based approach.
  - On any new action while an undo chain is partially rewound, the `redoStack` clears.
  - History state persists only for the current page load; refreshing the page clears both stacks and disables the controls.
- **UI affordances**
  - Add Undo/Redo buttons to the planner chrome with accompanying keyboard shortcuts (e.g., `Cmd/Ctrl + Z` and `Shift + Cmd/Ctrl + Z`).
  - Keep both buttons rendered at all times; when disabled the controls remain in place (with reduced emphasis) so layout stays stable while history depth changes.
  - Disable the buttons when their respective stack is empty, and display contextual tooltips that describe what will be undone/redone (e.g., "Undo delete track").
  - Remove confirmation prompts from destructive actions, replacing instructional copy with guidance that Undo is available.
- **Accessibility & messaging**
  - Announce undo/redo results via polite live region updates so screen-reader users receive confirmation without modal dialogs.
  - Animate state reversals using lightweight FLIP transforms and highlight flashes so sighted users can track where people move during undo/redo, respecting reduced-motion preferences.

## Alternatives Considered

- **Keep confirmations and add undo**
  - Rejected because a redundant confirmation undermines the speed benefit of undo, and users tend to dismiss dialogs reflexively.
- **Limited undo (e.g., only for deletions)**
  - Rejected since implementing a comprehensive history requires similar effort and avoids confusing gaps in coverage.
- **Persistent history across reloads**
  - Rejected to keep implementation simple and avoid surprising users with stale history when reopening the tool later.

## Consequences

**Pros**

- Speeds up common flows by eliminating modal confirmations.
- Gives users confidence that mistakes (including non-destructive ones) are recoverable.
- Aligns planner interactions with modern productivity UX conventions.

**Cons / Risks**

- Requires careful testing to ensure every mutating path pushes a correct history entry.
- Snapshot-based history may impact performance with extremely large rosters; we must monitor and optimize if needed.
- Users may initially miss the removed confirmations; onboarding copy must highlight the Undo affordance.

## Follow-Ups

- Add instrumentation (if available) to measure undo usage and identify gaps.
- Update documentation and onboarding to describe the new Undo/Redo controls and their session-scoped behavior.
