import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { axe } from 'jest-axe'

import { ChatTraceMeta } from '../src/components/chat-trace-meta'

describe('ChatTraceMeta', () => {
  const meta = () => container.querySelector<HTMLElement>('[data-as="chat-trace-meta"]')!
  let container: HTMLElement

  it('renders model, duration and tool-count badges', () => {
    ;({ container } = render(<ChatTraceMeta model="gpt-5.6" durationMs={1930} toolCount={2} />))
    expect(meta()).toHaveTextContent('gpt-5.6')
    expect(meta()).toHaveTextContent('1.9 s')
    expect(meta()).toHaveTextContent('2 tools')
  })

  it('pluralizes a single tool', () => {
    ;({ container } = render(<ChatTraceMeta toolCount={1} />))
    expect(meta()).toHaveTextContent('1 tool')
  })

  it('formats sub-second durations in milliseconds', () => {
    ;({ container } = render(<ChatTraceMeta durationMs={120} />))
    expect(meta()).toHaveTextContent('120 ms')
  })

  it('renders nothing without data', () => {
    const view = render(<ChatTraceMeta />)
    expect(view.container).toBeEmptyDOMElement()
  })

  it('ignores empty model strings and zero tool counts', () => {
    const view = render(<ChatTraceMeta model="" toolCount={0} />)
    expect(view.container).toBeEmptyDOMElement()
  })

  it('passes axe with a full trace', async () => {
    const { container } = render(<ChatTraceMeta model="gpt-5.6" durationMs={1930} toolCount={3} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
