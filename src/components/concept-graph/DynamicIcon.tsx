import React from 'react'
import * as LucideIcons from 'lucide-react'
import { HelpCircle } from 'lucide-react'
import DOMPurify from 'dompurify'
import type { ConceptGraphIcon } from './types'

/** Registry icons are data (they ride graph nodes), so custom SVG markup is
 *  sanitized before injection — script/foreignObject and event handlers are
 *  stripped, SVG profile only. */
export function sanitizeSvg(svg: string | null | undefined): string {
  if (!svg) return ''
  return DOMPurify.sanitize(svg, {
    USE_PROFILES: { svg: true, svgFilters: true },
    FORBID_TAGS: ['script', 'foreignObject'],
    FORBID_ATTR: ['onload', 'onclick', 'onerror', 'onmouseover'],
  })
}

export interface DynamicIconProps {
  icon: string | ConceptGraphIcon | null | undefined
  className?: string
  size?: number | string
  color?: string
}

type IconComponent = React.ComponentType<{
  className?: string
  size?: number | string
  color?: string
}>

function lookupIcon(name: string): IconComponent {
  const entry = (LucideIcons as unknown as Record<string, IconComponent>)[name]
  return entry ?? HelpCircle
}

/** Renders a lucide icon by name or a sanitized inline custom SVG. */
export const DynamicIcon: React.FC<DynamicIconProps> = ({
  icon,
  className = 'w-5 h-5',
  size,
  color,
}) => {
  if (!icon) {
    return <HelpCircle className={className} size={size} color={color} />
  }

  if (typeof icon === 'string') {
    const LucideIcon = lookupIcon(icon)
    return <LucideIcon className={className} size={size} color={color} />
  }

  if (icon.type === 'custom_svg') {
    return (
      <div
        className={`${className} flex items-center justify-center [&>svg]:w-full [&>svg]:h-full`}
        style={{ width: size, height: size, color: color }}
        dangerouslySetInnerHTML={{ __html: sanitizeSvg(icon.value) }}
      />
    )
  }

  if (icon.type === 'lucide') {
    const LucideIcon = lookupIcon(icon.value)
    return <LucideIcon className={className} size={size} color={color} />
  }

  return <HelpCircle className={className} size={size} color={color} />
}
