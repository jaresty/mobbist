# ADR: Drag-to-Create Track Affordance

- Status: Proposed
- Date: 2025-12-20
- Owners: Docs app maintainers
- Related:
  - `docs/adr/0001-pair-mob-planning-tool.md`
  - `apps/docs/src/pages/pair-planner.html`

## Context

The Pair/Mob Planning tool currently relies on an "Add track" button to append new tracks. That control breaks the flow of drag-and-drop interactions: whenever facilitators discover they need another track while rearranging people, they must exit the drag gesture, hit the button, and then resume moving people. Users have described this as a jarring interruption that feels inconsistent with the rest of the interface, which is otherwise optimized for direct manipulation.

We want to make creating a new track feel like a natural extension of moving people around. A dedicated drop zone, revealed only during drag operations, aligns with the existing interaction model while keeping the UI uncluttered when no one is in motion.

## Decision

Introduce a drag-sensitive drop zone directly after the final normal track. When a person is dragged onto this zone, the UI creates a new normal track in-place and drops the person into it. The button-based "Add track" control will be removed from the primary surface.

## Details

- **Drop zone behavior**
  - Hidden in the resting state to avoid stealing focus from existing tracks.
  - Appears when the user starts dragging a person, adopting the same visual treatment as other drop targets with additional copy such as "Drop to create a new track".
  - Accepts drops only while an eligible person is being dragged. Keyboard-initiated drags expose the drop zone in the same way and allow the drop through the keyboard interaction.
- **Track creation**
  - Creates a new `normal` track appended after all other normal tracks but before the trailing drop zone.
  - Generates a new track identifier using the existing ID generator used for normal tracks.
  - Seeds the track with the dropped person and sets `capacity: null` (unlimited) until the user edits it.
  - Opens an inline rename input immediately after creation; if the user dismisses it without changes, the track keeps an auto-generated name following the current naming scheme (for example, "Track F").
- **Persistence**
  - The new track and the repositioned person are written to local storage in the same transaction as other drag-and-drop updates.
  - Undo/redo support (see separate ADR) will treat the creation-drop sequence as a single action so it can be reverted cleanly.
- **Accessibility**
  - The drop zone is announced to assistive technologies when it becomes available, with instructions describing that dropping will create a track.
  - A fallback "Add track" command remains available from the command menu and via keyboard shortcut to cover scenarios where drag-and-drop is unavailable or undesired, keeping parity with accessibility expectations without exposing the button visually.

## Alternatives Considered

- **Retain the button and add a drop zone**
  - Rejected to keep the surface visually simple; the command palette fallback preserves accessibility without duplicating affordances.
- **Always-visible empty track template**
  - Rejected because a persistent empty column takes up valuable horizontal space and increases visual noise when no new track is needed.
- **Context menu option on tracks**
  - Rejected since it still interrupts the drag flow and requires more clicks than the drop zone.

## Consequences

**Pros**

- Keeps users in a single interaction mode when expanding the plan.
- Reduces clutter by only surfacing creation UI during drag operations.
- Encourages track creation exactly where the user needs it in the workflow.

**Cons / Risks**

- Users unfamiliar with drag-and-drop may take longer to discover that the drop zone creates tracks.
- Requires thoughtful animation and messaging to ensure the new affordance is obvious during the first drag.
- Removal of the visible button may surprise returning users until they learn the new pattern.

## Follow-Ups

- Implement the drop zone component and integrate it with the existing drag-and-drop system.
- Add copy and animation that make the creation affordance discoverable (e.g., a gentle pulse when a drag starts).
- Update help text and onboarding to mention the new creation flow and the command palette fallback.
- Instrument analytics (if available) to confirm users still succeed at adding tracks post-change.
