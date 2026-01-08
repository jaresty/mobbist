# ADR: Export/Import Clipboard Enhancements

- Status: Accepted
- Date: 2026-01-08
- Owners: Pair Planner maintainers
- Related:
  - `docs/adr/0007-clipboard-board-state.md`

## Context

The planner's clipboard workflow already enables sharing daily standup snapshots as Markdown, but recurring pain points remain. Facilitators routinely edit the exported "Meta" section to fit broader documentation systems that expect frontmatter, forcing manual tweaks before publishing. Recipients lack a fast way to relaunch Mobbist with that snapshot because the export has no deep link back to the app. Finally, the "load clipboard" affordance is easy to miss, especially for invited collaborators, even when the URL explicitly signals that the page should pre-populate from the shared content. These gaps create unnecessary friction when transferring ownership across time zones or devices.

## Decision

Standardize the clipboard-powered export/import workflow around more automation-friendly conventions: emit YAML frontmatter for meta data, respect explicit query parameters to auto-import from the clipboard on load, and embed an "Open in Mobbist" link in the exported Markdown that signals the app to hydrate from clipboard contents.

## Details

- **Markdown contract updates**
  - Rewrite the meta block as YAML frontmatter (`---` fence) containing timestamp, planner identifier, export format version, and optional facilitator notes.
  - Treat the frontmatter as authoritative when importing; gracefully ignore additional Markdown sections if present.
  - Maintain backwards compatibility by accepting the previous meta layout when frontmatter is absent, while logging deprecation metrics.
- **Clipboard autoload trigger**
  - Introduce a query parameter (e.g., `?load=clipboard`) that, when present, calls the import pipeline automatically after confirming clipboard permissions.
  - Provide a non-blocking toast summarizing the imported snapshot, with an undo affordance using the existing history stack.
  - Halt the autoload if the clipboard lacks a recognizable export or the user declines permission, surfacing a targeted error message.
- **Deep link in exports**
  - Append a short call-to-action section to the exported Markdown containing a hyperlink to `https://app.mobbist.dev/?load=clipboard` (environment aware for staging/dev).
  - Clearly label the link so recipients know it will launch Mobbist and request clipboard access to hydrate the board.
  - Update Slack previews/documentation so the link is visually separated from lane content, reducing accidental clicks while still discoverable.

## Alternatives Considered

- **Keep the existing meta heading**
  - Rejected because frontmatter interoperability is now a common requirement for publishing daily logs into knowledge bases.
- **Require users to press an "Import from clipboard" button**
  - Rejected; it adds cognitive load and undermines the benefit of query-driven deep links for scheduled rotations.
- **Embed serialized board JSON in the Markdown link**
  - Rejected due to bloated links that risk hitting client and messaging platform limits and expose raw implementation details.

## Consequences

**Pros**

- Simplifies knowledge base ingestion by aligning with widespread Markdown frontmatter conventions.
- Reduces onboarding friction for recipients, who can launch Mobbist and see the shared state with a single click.
- Encourages consistent clipboard exports, improving reliability metrics for the import parser over time.

**Cons / Risks**

- Auto-importing on page load may surprise users if clipboard contents are stale or unrelated; clear messaging is required.
- Frontmatter parsing introduces another branch in the import logic that must remain backward compatible with legacy exports.
- Deep links rely on browser clipboard permissions, which can differ across managed environments and could degrade gracefully.

## Follow-Ups

- Update the serializer/deserializer to emit and parse YAML frontmatter, including regression tests for legacy exports.
- Extend the client router/startup sequence to detect the clipboard autoload query and route failures to an inline notification.
- Refresh facilitator documentation and in-app help text to explain the new deep link behavior and clipboard prompts.
