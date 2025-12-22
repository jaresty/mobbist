# ADR: Lock Lanes to Protect Allocations

- Status: Accepted
- Date: 2025-12-21
- Owners: Pair Planner maintainers
- Related:
  - `docs/adr/0001-pair-mob-planning-tool.md`
  - `docs/adr/0003-undo-redo-history.md`

## Context

Facilitators rely on bulk actions such as Sweep All and Allocate All People to rapidly rebalance a plan. These actions touch every lane, even those that already contain carefully curated lineups (for example, lanes assigned to external stakeholders or fixed specialty rotations). Today the only way to protect these lanes is to avoid running global operations or to manually rework the impacted lane after each bulk action, both of which slow teams down and increase the risk of errors. We need an explicit mechanism that lets facilitators freeze a lane so subsequent global adjustments skip it without removing the ability to manually edit it when necessary.

## Decision

Introduce a lock state on lanes. When a lane is locked, all global or bulk operations (Sweep All, Allocate All People, Shuffle roles, Shuffle people, etc.) treat the lane as read-only and leave its assignments untouched. Facilitators can still edit a locked lane directly (e.g., drag people in or out) after confirming the lock, but global workflows ignore the lane until it is unlocked.

## Details

- **Lock affordance**
  - Add a lock toggle to each lane header that clearly indicates whether the lane is locked or unlocked.
  - Lock status persists with planner state so reloading the session keeps previously locked lanes locked.
  - Provide a tooltip or inline helper text to explain that locked lanes are excluded from bulk operations.
  - Surface locked state in the lane chrome (badges, drop styling) so drag-and-drop communicates why targets are blocked.
- **Global operations**
  - Update Sweep All, Allocate All People, Shuffle People, Shuffle Roles, and similar future-wide commands to skip over locked lanes entirely, even when creating new tracks for capacity.
  - Ensure undo/redo captures lock/unlock actions and preserves existing history semantics for bulk operations that now bypass locked lanes.
- **Manual interaction**
  - Allow direct edits (drag/drop, role assignment changes) on locked lanes only after an explicit confirmation so facilitators do not accidentally modify protected lanes. Confirmation prompts aggregate all impacts (remove, add, capacity bump) into a single dialog per action.
  - Maintain existing validation (e.g., capacity rules) when editing a locked lane manually, letting users overfill only when they explicitly approve raising capacity.
  - Skip confirmations during undo/redo so restoring a prior state is always one click.
- **State management**
  - Represent the lock as a boolean property on the lane model, persisted wherever lanes are stored (client state, local storage, etc.).
  - Default new lanes to unlocked to avoid surprising users during creation flows.

## Alternatives Considered

- **Soft warning instead of lock**
  - Rejected because warnings are easy to dismiss and still allow bulk actions to override protected lanes.
- **Per-operation opt-out lists**
  - Rejected as overly complex for facilitators and harder to maintain than a single lock concept.
- **Prevent all editing on locked lanes**
  - Rejected to keep lanes flexible; clubs may still need to tweak a locked lane manually without re-running global workflows.

## Consequences

**Pros**

- Protects high-priority lanes from unintended changes during bulk operations.
- Lets facilitators move quickly without pausing to reconfigure every time they fine-tune part of the plan.
- Creates a clear mental model for when lanes participate in global automation.

**Cons / Risks**

- Introduces another control in the lane header that could add visual complexity.
- Requires regression coverage to ensure every bulk action consults the lock state.
- Teams must remember to unlock lanes when they should participate again in bulk updates.

## Follow-Ups

- Update facilitator onboarding and help docs to explain locking behavior.
- Add analytics or logging (if available) to measure how often locks are used and whether skipped lanes lead to unexpected states.
- Ensure automated tests cover each global operation to verify locked lanes remain unchanged.
