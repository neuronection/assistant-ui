import * as React from 'react'
import { createPortal } from 'react-dom'

export interface PortalProps {
  children: React.ReactNode
  container?: HTMLElement | null
}

export function Portal({ children, container }: PortalProps) {
  if (typeof document === 'undefined') return null
  const mount = container ?? document.body
  return createPortal(children, mount)
}
