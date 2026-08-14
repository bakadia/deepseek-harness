# Agent Note: Conversation scrollbar map (user-turn navigation rail in the chat view)

Status: implemented

## Problem

A long conversation page makes it tedious to locate an earlier user question: the reader must scroll up blindly, with no per-turn landmarks. There was no way to jump straight to a specific turn from outside the transcript (no per-message anchors surfaced away from the scrollport), and the conversation's own scroll memory only restored one position.

## Decision

Add a fixed-position **scrollbar map** to the active conversation (chat) view: a thin rail overlaying the column's right edge (the native scrollbar gutter) that maps every rendered user-question turn to one small horizontal bar, positioned by that row's content offset through the transcript's total scroll height. This follows the familiar editor-minimap / alphabetical-contact-index interaction.

- **Geometry and ownership live in `ChatView`** (the view already owns the transcript's scrollport, `listRef`/`scrollerOf`/`anchorElement`/`scrollPosition`). It derives the mark set from the ordered Chat nodes (`user` + `steering` kinds), measures each rendered row's content offset, and produces a plain `ScrollbarMapRail` payload (viewport rect + marks).
- **`ScrollbarMap` is a pure presentational component**: it renders the fixed rail and one `Tooltip`-wrapped bar per mark. It performs no measurement; all DOM coupling stays in the view, which is the layer that already owns scroll geometry.
- **Hover → question text**: each bar wraps the shared `Tooltip` primitive with a 1 s dwell (`delayMs: 1000`, `side: right`), showing the user's question text overlaid on the transcript. Non-text (e.g. image-only) messages fall back to a locale label.
- **Click → jump**: a click scrolls the transcript so that turn's row tops the viewport, records the programmatic scroll in the view's observe-top ledger (so it is never misread as reader input), and disables bottom-follow.
- **When it re-measures**: on mount/open, on content or window size change, and after a `loadOlder` prepend — deliberately NOT on reader scrolls, because marks are content-referenced (offset ÷ total height), so scrolling slides the same transcript past a rail whose viewport geometry is already fixed. Content-growth re-measure rides the transcript's existing single `ResizeObserver` (the same one that drives dynamic-height follow), so the rail adds no second observer.
- The rail is keyboard-reachable and announced (`nav` landmark, per-mark `aria-label`).

## Alternatives considered

- **A fixed idea of "one turn = one label" using turn data only** — rejected because a turn can open with several messages and steering appears mid-turn; rendering every user/steering Node keeps the map aligned with what the reader actually sees.
- **A dedicated list/row of clickable questions** — rejected: it would duplicate the transcript and cost vertical space; the scrollbar rail is zero-dimensional overlay chrome.
- **A custom wheel-over-interaction / draggable thumb** — deferred; the ask was hover-preview + click-jump, which the rail delivers with no new pointer machinery.

## Consequences

- A new chat-view feature adds one overlay component; hiding it (blank session, no marks yet) returns `null` and costs zero layout.
- Marks cover only **currently rendered** rows (the loaded history page), so older pages loaded via `loadOlder` extend the map as they arrive; it is a view of the loaded transcript, not the full durable log.
- The tooltip's own fit logic flips/slides it inside the viewport, so a rail pinned to the right edge never clips the question preview.

## Verification

`pnpm run test:gui` is green (client + host), including: `ScrollbarMap` unit specs (null rails, mark positioning by content fraction, click-jump callback, delayed tooltip) and `ChatView` integration specs (measure-then-render, per-turn marks, jump scroll offset, non-text fallback label, rail hidden before measurement). The rail re-measures through the existing single ResizeObserver, so the pre-existing "one observer owns dynamic-height follow" test still passes unchanged.
