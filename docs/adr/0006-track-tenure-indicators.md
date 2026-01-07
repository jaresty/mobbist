# ADR: Track Tenure Indicators for Facilitators

- Status: Accepted
- Date: 2026-01-06
- Owners: Pair Planner maintainers
- Related:
  - `docs/adr/0001-pair-mob-planning-tool.md`
  - `docs/adr/0005-lock-lane.md`

## Context

Facilitators often keep people in the same track for extended periods when urgent reshuffles focus attention elsewhere. Without any signal about how long someone has been assigned to a track, it is easy to miss stale placements that sap learning opportunities, burn out specialists, or violate rotation policies. Today, facilitators must rely on memory or out-of-band spreadsheets to notice overstays, which breaks the lightweight, single-page workflow established for the planner.

We need an in-tool mechanism that highlights when a person has exceeded their intended tenure in a track while respecting the planner’s low-friction ethos. The indication should be quiet enough to avoid alarm fatigue but visible enough to nudge facilitators to rebalance.

## Decision

Track how long each person has been assigned to their current track and surface a subtle, escalating visual indicator once configurable tenure thresholds are reached. Tenure metadata lives alongside existing lane assignments, updates automatically on moves, and feeds lightweight UI cues that prompt facilitators to consider reallocating overstaying people.

## Details

- **Data model**
  - Extend the per-person assignment state with `assignedAt` timestamps keyed by track ID.
  - Persist tenure metadata with the rest of the planner state (Local Storage) and include it in undo/redo snapshots.
  - Reset a person’s `assignedAt` when moved to any new track, including Out of Office and On Deck.
- **Threshold configuration**
  - Provide defaults (e.g., soft warning at 2 days, stronger at 4) derived from common rotation cadences.
  - Allow teams to customize thresholds globally from planner settings; values apply to all lanes unless overridden per lane.
  - Permit lane-specific overrides for tracks with known longer tenures (e.g., specialty queues).
- **Indicator design**
  - Use progressive styling in the person chip (e.g., border color shift, small timer badge) instead of modal alerts.
  - Ensure indicators meet contrast requirements and include textual tooltips describing time-in-track.
  - De-emphasize indicators while the planner is in aggregate views (e.g., collapsed lanes) to avoid clutter.
- **Facilitator workflows**
  - Offer a “Show longest-tenured first” sort to quickly bubble up people exceeding thresholds.
  - Add filters to list all people breaching the stronger threshold within the current plan.
  - Provide quick actions (e.g., sweep back to On Deck) from the indicator tooltip.
- **System behavior**
  - Exclude tenure counting for attendees temporarily moved to Out of Office; resume once reassigned to a normal lane.
  - Ensure undo/redo of moves restores both placement and the original `assignedAt` timestamp.
  - Maintain performance by batching tenure recalculations and limiting UI updates to affected lanes.

## Alternatives Considered

- **Manual rotation logs**
  - Rejected because external tracking adds friction and breaks the single-page workflow goal.
- **Blocking moves once tenure exceeded**
  - Rejected as too heavy-handed; facilitators need flexibility and should not be forced into immediate action.
- **Global notifications or emails**
  - Rejected to keep signals inside the planner and avoid notification fatigue.

## Consequences

**Pros**

- Keeps facilitators within the planner while spotting overstays.
- Encourages healthier rotation cadence without disruptive alerts.
- Provides data for retrospective analysis of rotation hygiene.

**Cons / Risks**

- Requires careful tuning to avoid visual noise or desensitization.
- Adds complexity to state persistence and undo/redo flows.
- Depends on clock accuracy; time drift across devices could create inconsistent cues.

## Follow-Ups

- Implement tenure timestamp capture in assignment mutations and persist through Local Storage schema updates.
- Design and user-test indicator visuals to validate subtlety versus visibility.
- Update facilitator documentation with guidance on configuring thresholds and interpreting cues.
- Add analytics hooks (if available) to inform future tuning of default thresholds.
