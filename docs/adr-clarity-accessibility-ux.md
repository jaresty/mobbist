# ADR: Improve Planner Safety, Clarity, and Accessibility for Heavy Use

- **Status:** Proposed  
- **Date:** 2025-12-05  
- **Owners:** _TBD_  

## Context

After the first round of UX hardening for large teams (scrollable people lists, clarified capacity semantics, safer retire, icons, and button ordering), a second adversarial pass surfaced remaining issues:

- Heavy reliance on tiny icon-only buttons (`🔀`, `⬅️`, `👋`, etc.) with meaning mostly discoverable via hover tooltips; this is weak on touch devices and for less icon-literate users.
- Track-level sweep (`⬅️ Sweep (keep one)`) is a powerful, destructive bulk action with no confirmation.
- Retire’s two-step flow is logically safe, but the pending state is subtle: only one person can be pending globally, it’s not obvious who that is beyond button changes, and there’s no explicit row-level highlight.
- Disabled Shuffle relies on hover tooltips to explain “No track has capacity”; the reason is not visible at a glance.
- Moving people still requires drag or tiny icon buttons; keyboard users have no alternative path.

We want to improve clarity and safety under heavy use without bloating the UI.

## Decision

We will:

1. Augment icon buttons with minimal text or responsive labels to reduce ambiguity, especially on desktop.
2. Add confirmation and visual demotion for bulk sweep actions to reflect their destructive nature.
3. Make the retire pending state visually obvious at the row level and clearly tied to a specific person.
4. Surface capacity-related constraints more clearly instead of relying solely on disabled states and tooltips.
5. Introduce a simple keyboard-accessible “Move to…” mechanism as an alternative to drag-and-drop and tiny icons.

## Details

### 1. Icons plus minimal labels

- For per-person actions, adopt an icon + short-text pattern on desktop, for example:
  - `🔀 Shuffle`, `⬅️ Sweep`, `👋 Retire` with truncated text where needed.
- On narrow viewports, prefer icons only (current behavior) but keep accessible `title` and `aria-label` attributes.
- Ensure the order remains: primary (`Shuffle`), neutral (`Sweep`), visually separated destructive (`Retire`).

### 2. Safer sweep actions

- Track-level sweep:
  - Add a confirm step similar to retire: first click marks the track as “pending sweep”; second click confirms.
  - Alternatively, show a one-time confirm dialog (“Sweep N people back to On Deck, keeping one here?”).
  - Consider downgrading styling (e.g., ghost or secondary) to visually distinguish it from primary interactions.
- Per-person sweep remains single-click, but clarify via tooltip (“Sweep this person to On Deck (non-destructive)”).

### 3. Clear retire pending state

- When a person is pending retire:
  - Highlight the entire row (e.g., light red background) and/or show a small inline label like “Retiring…” near the name.
  - Ensure only that row shows `✅` and `✖️` and all other rows clearly remain in the normal state.
- Optionally show the person’s name in the `title` of `✅` (for example, “Confirm retire Grace”) to reinforce context.

### 4. Capacity and disabled actions

- When Shuffle is disabled due to capacity:
  - Keep the tooltip, but also add a small inline note near the track list or header when all normal tracks are full (for example, “All tracks at capacity; shuffle disabled”).
- For full tracks:
  - Retain the `Full` label and orange border, and ensure drop-target styling never appears.
  - Consider a small description under the On Deck card clarifying: “When tracks are full, Shuffle and drag are disabled.”

### 5. Keyboard-accessible moves

- Add a simple “Move to…” control for each person:
  - For example, a small select or button that opens a native `<select>` listing eligible tracks (excluding Out of Office and respecting capacity).
  - Moving via this control should apply the same capacity checks and On Deck semantics as drag/shuffle.
- Ensure it is reachable via tab/enter for screen readers and keyboard users.

## Alternatives Considered

- Keep icon-only controls with hover tooltips only: Rejected; fails on touch and for users who do not explore tooltips.
- Remove icons and use text-only buttons: Rejected for now; would make dense lists visually heavy again.
- Always show a full “Move to…” dropdown instead of Shuffle/Sweep: Rejected; more clicks for the dominant flows and visually bulkier.

## Consequences

### Pros

- Clearer affordances and reduced ambiguity, especially for new users and on touch devices.
- Safer handling of destructive operations (sweep and retire) with strong visual cues and confirms.
- Better explanation of why actions are disabled, reducing confusion around capacity constraints.
- Improved accessibility and ergonomics via a keyboard-friendly “Move to…” option.

### Cons / Risks

- Slightly more complex UI (additional labels, states, and controls).
- Some increased horizontal space usage for buttons with short labels.
- Implementation requires careful tuning to keep dense lists readable, especially on small screens.

