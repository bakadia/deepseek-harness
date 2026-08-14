// ScrollbarMap: the pure render half of the conversation scrollbar map. It
// draws one fixed-position rail aligned with the active column's right edge
// and, for every user-question turn, a small horizontal bar mapped to that
// row's content offset. Hovering a bar (about one second) shows the user's
// question text; clicking jumps the transcript so that turn's row tops the
// viewport. All geometry and scroll math happens upstream in ChatView and is
// handed in as plain data — this component performs no measurement.

import { Tooltip } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ChatViewSlotProps } from '../contract/slots.ts'
import css from './ScrollbarMap.module.css'

/** One user-question turn's mapped mark, positioned by content fraction. */
export interface ScrollbarMapMark {
  /** Stable Chat Node key (matches the rendered row's `data-chat-anchor-key`). */
  readonly key: string
  /** The user's question text, or a locale fallback for non-text messages. */
  readonly label: string
  /** Content offset of the row / total scroll height, clamped to [0, 1]. */
  readonly topFraction: number
}

/** Fixed-position geometry of the conversation scrollport that hosts the map. */
export interface ScrollbarMapViewport {
  readonly top: number
  readonly left: number
  readonly height: number
}

/** The measure-ready rail payload computed by ChatView. */
export interface ScrollbarMapRail {
  readonly viewport: ScrollbarMapViewport
  readonly marks: readonly ScrollbarMapMark[]
}

/** Full props of the presentational rail. */
export interface ScrollbarMapProps {
  /** Measured rail payload; null hides the map (blank, loading, or no marks). */
  readonly rail: ScrollbarMapRail | null
  /** Jump the transcript to the turn identified by its Chat Node key. */
  readonly onJump: (key: string) => void
  /** Owning view's locale seat for the tooltip fallback. */
  readonly t: ChatViewSlotProps['t']
}

/**
 * Render the fixed conversation scrollbar map.
 * @param props - measured rail, jump callback, and locale seat.
 * @returns the rail overlay, or null while there is nothing to map.
 */
export function ScrollbarMap({ rail, onJump, t }: ScrollbarMapProps) {
  if (rail === null || rail.marks.length === 0) return null
  return (
    <nav
      className={css.rail}
      style={{ top: rail.viewport.top, left: rail.viewport.left, height: rail.viewport.height }}
      aria-label={t('chat.scrollbarMap.label')}
    >
      {rail.marks.map(mark => (
        <Tooltip key={mark.key} label={mark.label} side="right" delayMs={1000} maxWidth={300}>
          <button
            type="button"
            className={css.mark}
            style={{ top: `${(mark.topFraction * 100).toFixed(2)}%` }}
            aria-label={t('chat.scrollbarMap.jump', { label: mark.label })}
            onClick={() => { onJump(mark.key) }}
          />
        </Tooltip>
      ))}
    </nav>
  )
}
