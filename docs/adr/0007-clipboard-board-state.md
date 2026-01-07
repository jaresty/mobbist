# ADR: Clipboard Import/Export for Planner Board

- Status: Accepted
- Date: 2026-01-07
- Owners: Pair Planner maintainers
- Related:
  - `docs/adr/0001-pair-mob-planning-tool.md`
  - `docs/adr/0003-undo-redo-history.md`

## Context

Facilitators currently snapshot the board by copying lane contents manually into Slack or capturing screenshots. This workflow is time-consuming, inconsistently formatted, and creates friction when reconstructing yesterday's state before a standup. The planner already stores its full state client-side, but there is no way to serialize that data into a portable, human-friendly format suitable for daily sharing channels. Likewise, there is no import path that understands a previously shared update and restores the board without drag-and-drop reproduction.

## Decision

Adopt a Markdown-based clipboard format that captures the full board state in a Slack-friendly layout and support bidirectional clipboard operations: exporting the current board to Markdown and importing a compatible Markdown paste back into the planner.

## Details

- **Format contract**
  - Represent each lane as a second-level heading with the lane name and optional facilitator metadata.
  - List work items under each lane as unordered lists, including assignees, role tags, and status badges rendered as inline tokens (e.g., `[#blocked]`).
  - Include a "Meta" section containing ISO timestamp, planner name, and format version to guard against incompatible schema changes.
  - Ensure the Markdown renders legibly in Slack and preserves ordering when pasted back into the planner.
- **Export pipeline**
  - Traverse the in-memory board state and serialize lanes, cards, roles, notes, and backlog sections into the Markdown contract.
  - Copy the formatted Markdown string to the clipboard and optionally show a toast confirming success.
  - Provide a download fallback (e.g., `.md` file) if clipboard APIs are unavailable.
- **Import pipeline**
  - Detect clipboard paste events in the planner and attempt to parse the Markdown, validating the version header before mutating state.
  - Map Markdown sections back into lane structures, recreating cards, assignments, tags, and auxiliary fields while preserving existing IDs when possible to keep undo/redo history coherent.
  - On validation failure, surface an actionable error explaining required format and leave the current board untouched.
- **Versioning and safety**
  - Embed a semantic version in the Meta block; reject or warn on newer versions that the client does not understand.
  - Keep import/export behind feature gating until analytics confirm reliability, and log recoverable parse errors for debugging.
  - Maintain existing undo/redo integration by wrapping imports in a single transactional snapshot.

## Alternatives Considered

- **JSON export/import only**
  - Rejected because raw JSON is unreadable in Slack and defeats the goal of lightweight standup sharing.
- **Image-based capture**
  - Rejected since screenshots cannot be re-imported and lack accessibility.
- **One-way export without import**
  - Rejected because facilitators explicitly want to bootstrap today's board from yesterday's shared state.

## Consequences

**Pros**

- Reduces daily friction for facilitators by enabling copy/paste workflows that match existing Slack habits.
- Provides a self-documenting, versioned artifact that can be archived alongside standup notes.
- Opens the door to programmatic integrations that consume the Markdown format.

**Cons / Risks**

- Parsing Markdown is error-prone if users edit the text heavily before importing.
- Requires careful normalization to avoid ID drift that would break undo/redo semantics.
- Clipboard APIs have browser permission nuances that may degrade UX on restricted environments.

## Follow-Ups

- Define the precise Markdown grammar, including escaping rules for special characters.
- Implement serializers/deserializers with comprehensive tests covering varied board configurations.
- Add UI affordances for "Copy board as Markdown" and "Import board from clipboard" actions.
- Document the workflow in facilitator onboarding material and provide troubleshooting guidance.
