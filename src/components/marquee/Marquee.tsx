import * as React from 'react'

export interface Rect {
  left: number
  top: number
  right: number
  bottom: number
}

export function rectsIntersect(a: Rect, b: Rect): boolean {
  return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom
}

export function marqueeRect(
  startX: number,
  startY: number,
  currentX: number,
  currentY: number,
): Rect {
  return {
    left: Math.min(startX, currentX),
    top: Math.min(startY, currentY),
    right: Math.max(startX, currentX),
    bottom: Math.max(startY, currentY),
  }
}

export function hitTestIds(container: HTMLElement, marquee: Rect): string[] {
  const hits: string[] = []
  const elements = container.querySelectorAll<HTMLElement>('[data-selectable-id]')
  for (const element of elements) {
    const box = element.getBoundingClientRect()
    const itemRect: Rect = {
      left: box.left,
      top: box.top,
      right: box.right,
      bottom: box.bottom,
    }
    if (rectsIntersect(marquee, itemRect)) {
      const id = element.getAttribute('data-selectable-id')
      if (id !== null) {
        hits.push(id)
      }
    }
  }
  return hits
}

const DRAG_THRESHOLD = 4

const INTERACTIVE_SELECTOR =
  'button, input, textarea, select, a, [data-selectable-id], [data-no-marquee]'

export type MarqueePhase = 'start' | 'drag' | 'end'

export interface UseMarqueeOptions {
  enabled: boolean
  containerRef: { current: HTMLElement | null }
  getBaseSelection: () => Set<string>
  onSelect: (ids: string[], phase: MarqueePhase) => void
}

export function useMarquee({
  enabled,
  containerRef,
  getBaseSelection,
  onSelect,
}: UseMarqueeOptions): { band: Rect | null } {
  const [band, setBand] = React.useState<Rect | null>(null)
  const startRef = React.useRef<{ x: number; y: number; base: Set<string> } | null>(null)
  const armedRef = React.useRef(false)
  const getBaseRef = React.useRef(getBaseSelection)
  getBaseRef.current = getBaseSelection
  const onSelectRef = React.useRef(onSelect)
  onSelectRef.current = onSelect

  React.useEffect(() => {
    if (!enabled) {
      return
    }
    const container = containerRef.current
    if (container === null) {
      return
    }

    const onMouseDown = (event: MouseEvent) => {
      if (event.button !== 0) {
        return
      }
      const target = event.target as Element | null
      if (target !== null && target.closest(INTERACTIVE_SELECTOR) !== null) {
        return
      }
      const base =
        event.ctrlKey || event.metaKey
          ? new Set(getBaseRef.current())
          : new Set<string>()
      startRef.current = { x: event.clientX, y: event.clientY, base }
      armedRef.current = false
    }

    const onMouseMove = (event: MouseEvent) => {
      const start = startRef.current
      if (start === null) {
        return
      }
      const rect = marqueeRect(start.x, start.y, event.clientX, event.clientY)
      if (!armedRef.current) {
        if (
          rect.right - rect.left < DRAG_THRESHOLD &&
          rect.bottom - rect.top < DRAG_THRESHOLD
        ) {
          return
        }
        armedRef.current = true
        onSelectRef.current([...start.base], 'start')
      }
      setBand(rect)
      const containerNow = containerRef.current
      if (containerNow !== null) {
        const hits = hitTestIds(containerNow, rect)
        onSelectRef.current([...new Set([...start.base, ...hits])], 'drag')
      }
    }

    const finish = (event: MouseEvent) => {
      const start = startRef.current
      if (start === null) {
        return
      }
      startRef.current = null
      setBand(null)
      if (armedRef.current) {
        const containerNow = containerRef.current
        if (containerNow !== null) {
          const rect = marqueeRect(start.x, start.y, event.clientX, event.clientY)
          const hits = hitTestIds(containerNow, rect)
          onSelectRef.current([...new Set([...start.base, ...hits])], 'end')
        }
        return
      }
      if (!event.ctrlKey && !event.metaKey) {
        onSelectRef.current([], 'end')
      }
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && startRef.current !== null) {
        const start = startRef.current
        startRef.current = null
        setBand(null)
        onSelectRef.current([...start.base], 'end')
      }
    }

    container.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', finish)
    window.addEventListener('keydown', onKey)
    return () => {
      container.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', finish)
      window.removeEventListener('keydown', onKey)
    }
  }, [enabled, containerRef])

  return { band }
}

export function MarqueeBand({ band }: { band: Rect | null }) {
  if (band === null) {
    return null
  }
  return (
    <div
      data-as="marquee-band"
      className="pointer-events-none fixed z-40 rounded-[calc(var(--as-radius-sm)-2px)] border border-[var(--as-primary)] bg-[var(--as-primary)]/10"
      style={{
        left: band.left,
        top: band.top,
        width: band.right - band.left,
        height: band.bottom - band.top,
      }}
      aria-hidden
    />
  )
}

export interface MarqueeSelection {
  selected: Set<string>
  set: (ids: string[]) => void
  clear: () => void
}

export interface MarqueeSurfaceProps extends React.ComponentProps<'div'> {
  children: React.ReactNode
  selection: MarqueeSelection
  clearBlocked?: () => boolean
}

export const MarqueeSurface = React.forwardRef<HTMLDivElement, MarqueeSurfaceProps>(
  function MarqueeSurface({ children, selection, clearBlocked, className, ...props }, ref) {
    const paneRef = React.useRef<HTMLDivElement | null>(null)
    React.useImperativeHandle(ref, () => paneRef.current as HTMLDivElement)
    const { band } = useMarquee({
      enabled: true,
      containerRef: paneRef,
      getBaseSelection: () => selection.selected,
      onSelect: (ids) => selection.set(ids),
    })
    React.useEffect(() => {
      const onKey = (event: KeyboardEvent) => {
        if (clearBlocked?.() ?? false) {
          return
        }
        const target = event.target
        if (
          target instanceof Element &&
          target.closest('input, textarea, select, [contenteditable="true"]') !== null
        ) {
          return
        }
        if (event.key === 'Escape') {
          selection.clear()
        }
      }
      window.addEventListener('keydown', onKey)
      return () => window.removeEventListener('keydown', onKey)
    }, [clearBlocked, selection])
    return (
      <div ref={paneRef} data-marquee-surface="" data-as="marquee-surface" className={className} {...props}>
        {children}
        <MarqueeBand band={band} />
      </div>
    )
  },
)
