import * as React from 'react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'
import { MenuContent, MenuItem } from '../menu/Menu'

export interface ContextMenuItem {
  key: string
  label: string
  icon?: LucideIcon
  onSelect?: () => void
  danger?: boolean
  disabled?: boolean
  hint?: string
}

export interface ContextMenuProps {
  x: number
  y: number
  items: ContextMenuItem[]
  onClose: () => void
  className?: string
}

export function ContextMenu({ x, y, items, onClose, className }: ContextMenuProps) {
  const open = items.length > 0
  return (
    <DropdownMenuPrimitive.Root open={open} onOpenChange={(next) => !next && onClose()} modal={false}>
      <DropdownMenuPrimitive.Trigger asChild aria-hidden tabIndex={-1}>
        <span
          data-as="context-menu-anchor"
          style={{ position: 'fixed', left: x, top: y, width: 0, height: 0 }}
        />
      </DropdownMenuPrimitive.Trigger>
      <MenuContent
        align="start"
        sideOffset={2}
        collisionPadding={8}
        data-as="context-menu"
        onCloseAutoFocus={(event) => event.preventDefault()}
        className={cn('min-w-40', className)}
      >
        {items.map((item) =>
          item.disabled === true ? (
            <span
              key={item.key}
              role="menuitem"
              aria-disabled="true"
              title={item.hint}
              className="pointer-events-none flex w-full cursor-default select-none items-center gap-2 rounded-[calc(var(--as-radius-sm)-2px)] px-2 py-1.5 text-left text-sm text-[var(--as-muted-fg)] opacity-50 [&_svg]:size-4 [&_svg]:shrink-0"
            >
              {item.icon ? <item.icon aria-hidden /> : null}
              {item.label}
            </span>
          ) : (
            <MenuItem
              key={item.key}
              icon={item.icon}
              danger={item.danger}
              title={item.hint}
              onSelect={() => item.onSelect?.()}
            >
              {item.label}
            </MenuItem>
          ),
        )}
      </MenuContent>
    </DropdownMenuPrimitive.Root>
  )
}
