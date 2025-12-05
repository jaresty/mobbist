# ADR: Improve Planner UX & Scalability for Large Teams

- **Status:** Proposed  
- **Date:** 2025-12-05  
- **Owners:** _TBD_  

## Context

The current planner (`index.html`) works well for small teams but shows usability and robustness issues when managing large rosters and many tracks (“lanes”):

- Large teams create extremely tall “On Deck” and track cards, with every person fully rendered and drag-enabled.
- Capacity constraints are enforced via blocking `alert` dialogs, and capacity downsizing is disallowed if it would overflow.
- Per-person actions (Sweep / Shuffle / Retire) are dense and easy to mis-click; “Retire” is destructive.
- Drag-and-drop visually invites drops into full tracks, then rejects them via alerts.
- Layout simply stacks more tracks and rows without inner scrolling or summary; keyboard and screen-reader flows are weak.

We want to make this tool reliable, predictable, and safe for large teams (50–100+ people, many tracks) without over-engineering.

## Decision

We will:

1. Scale the UI for large rosters by bounding card height, introducing inner scroll for people lists, and reducing DOM/drag overhead where practical.
2. Replace intrusive alerts with inline, state-based feedback for capacity violations and unavailable operations.
3. Loosen and clarify capacity behavior so shrinking capacity is allowed, with deterministic auto-overflow rules.
4. Make destructive actions safer and per-person controls less error-prone.
5. Improve allocation and drag behavior to better respect capacity and offer clearer, more scalable flows.

## Details

### 1. Scalable people list rendering

- Set a reasonable max height for `.people-list` and enable vertical scrolling; avoid unbounded track height.
- Defer advanced virtualization; if we later hit performance limits, introduce simple virtualization for large lists (e.g., render only the first N, with “+X more” expand).
- Keep each person visually identifiable:
  - Optionally show a short, unique label (e.g., index or generated short ID) alongside the name.
  - Do not dedupe by default, but consider an optional “highlight duplicates” mode as a future enhancement.

### 2. Inline capacity feedback instead of alerts

- For full tracks:
  - Mark them visually as “Full” (e.g., badge or text near capacity label).
  - Disable them as drop targets: no hover “drop” styling when at capacity, and prevent `onDrop` rather than accepting and then alerting.
- For `Shuffle`:
  - If no eligible track has capacity, disable the Shuffle button for that person with an inline tooltip (“No track has capacity”); avoid popping alerts.

### 3. Capacity resizing semantics

- Allow shrinking capacity below current assignment:
  - On reducing capacity, overflowed people are automatically moved back to On Deck (deterministic rule: e.g., overflow in reverse assignment order or by random, but consistent across the app).
- Replace the current “capacity lower than assigned → alert and abort” with:
  - A one-time confirmation when the new capacity would cause moves (“X people will be moved back to On Deck. Continue?”).
  - After confirmation, perform the moves and update UI; no extra alerts.

### 4. Safer destructive actions and cleaner per-person controls

- Make `Retire` harder to mis-click:
  - Either move it into a secondary action (e.g., “⋯” menu) or require a two-step interaction (first click → “Confirm retire” inline).
  - Keep a confirmation, but avoid blocking `confirm` where possible; prefer inline confirmation UI and a subtle toast message (“Retired Alice from planner”).
- Reduce button density:
  - Consider grouping person actions into a small menu, or show only the most common (e.g., Sweep, Shuffle) and tuck Retire away.
- Preserve current single-person semantics (one person at a time) to keep implementation simple.

### 5. Allocation & drag behavior

- Keep the existing “Sweep & allocate” strategy but:
  - Ensure tracks that are full or at target capacity are clearly marked and not offered as drop targets.
  - Make On Deck’s behavior more explicit in the UI text: “Overflow from capacity changes and sweeps return here.”
- Drag-and-drop:
  - Only show the `.drop-target` styling on lists that can actually accept the person (respect type and capacity).
  - On invalid drop attempts (e.g., capacity rules changed mid-drag), fail silently or with a small inline notification in the relevant track, not a blocking alert.

### 6. Layout and accessibility

- Maintain the responsive grid but:
  - Ensure cards remain readable at small widths (avoid excessively narrow tracks by tweaking `minmax` or adding a max column count).
- Incrementally improve accessibility:
  - Preserve drag-and-drop for now, but introduce keyboard-accessible controls to move a person to another track (e.g., dropdown in the person row or “Move to…” action for advanced use).

## Alternatives Considered

- Leave behavior unchanged and document quirks: Rejected; issues are too impactful at real-world team sizes.
- Full rewrite with framework and virtualization library: Rejected for now; overkill for the current scope and adds build complexity.
- Strict deduping of person names: Rejected; names are not guaranteed unique in all teams and enforcing uniqueness could be surprising.

## Consequences

### Pros

- Significantly better UX for large teams; fewer modal interruptions.
- Tracks and On Deck remain usable when very full.
- Clearer, more predictable capacity and allocation semantics.
- Reduced risk of accidental destructive actions.

### Cons / Risks

- Slightly more complex UI/state logic (more inline states and confirmations).
- Some behaviors (e.g., auto-moving overflow on capacity shrink) are new and must be clearly communicated to avoid confusion.
- Without full virtualization, extremely large rosters may still hit performance limits; we accept this as a future optimization.

## Implementation Notes

- Implement changes incrementally within `index.html`:
  - Update CSS for `.people-list`, track headers, and badges.
  - Refine `movePersonToTrack`, `updateTrackCapacity`, drag handlers, and per-person action handlers to reflect new semantics.
  - Replace blocking `alert`/`confirm` calls where feasible with inline UI; retain `confirm` only where necessary for destructive operations until we have better inline patterns.

