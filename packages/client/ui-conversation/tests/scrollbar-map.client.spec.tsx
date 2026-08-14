// @vitest-environment jsdom
// ScrollbarMap: the pure presentational half of the conversation scrollbar
// map. Asserts it renders one mark per measured user turn at the right
// content fraction, that clicking a mark jumps, and that the delayed hover
// tooltip surfaces the user's question text. Measurement lives in ChatView;
// this suite feeds pre-measured rails in.

import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { makeTranslate } from '@deepseek-ai/dsh-client-test-runtime'
import { zh as commonZh } from '@deepseek-ai/dsh-client-locale/src/locales/zh.ts'
import { zh } from '../src/client/locales.ts'
import { ScrollbarMap, type ScrollbarMapRail } from '../src/client/chat/ScrollbarMap.tsx'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

function makeT() {
  return makeTranslate(zh, commonZh)
}

const rail: ScrollbarMapRail = {
  viewport: { top: 10, left: 400, height: 400 },
  marks: [
    { key: 'user:1', label: '第一问', topFraction: 0.1 },
    { key: 'user:3', label: '第二问', topFraction: 0.3 },
  ],
}

describe('ScrollbarMap', () => {
  it('renders nothing while there is no measured rail', () => {
    const view = render(<ScrollbarMap rail={null} onJump={() => {}} t={makeT()} />)
    expect(view.container.querySelector('[class*="rail"]')).toBeNull()
  })

  it('renders nothing when the measured rail maps no marks', () => {
    const view = render(<ScrollbarMap rail={{ viewport: rail.viewport, marks: [] }} onJump={() => {}} t={makeT()} />)
    expect(view.container.querySelector('[class*="rail"]')).toBeNull()
  })

  it('positions one mark per user turn at its content fraction', () => {
    const view = render(<ScrollbarMap rail={rail} onJump={() => {}} t={makeT()} />)
    const nav = view.getByRole('navigation', { name: '对话内提问定位' })
    expect(nav).toBeTruthy()
    const buttons = [...nav.querySelectorAll('button')]
    expect(buttons).toHaveLength(2)
    expect(buttons[0]!.style.top).toBe('10%')
    expect(buttons[1]!.style.top).toBe('30%')
    expect(view.getByLabelText('跳到该提问：第一问')).toBeTruthy()
    expect(view.getByLabelText('跳到该提问：第二问')).toBeTruthy()
  })

  it('jumps to the turn named by the clicked mark', () => {
    const jump = vi.fn<(key: string) => void>()
    const view = render(<ScrollbarMap rail={rail} onJump={jump} t={makeT()} />)
    fireEvent.click(view.getByLabelText('跳到该提问：第二问'))
    expect(jump).toHaveBeenCalledWith('user:3')
  })

  it('shows the question text in a delayed tooltip on hover', () => {
    vi.useFakeTimers()
    const view = render(<ScrollbarMap rail={rail} onJump={() => {}} t={makeT()} />)
    const bar = view.getByLabelText('跳到该提问：第一问')
    fireEvent.mouseEnter(bar)
    // Zero elapsed: the bubble waits out the one-second dwell.
    expect(view.queryByText('第一问')).toBeNull()
    act(() => { vi.advanceTimersByTime(1000) })
    expect(view.getByText('第一问')).toBeTruthy()
  })
})
