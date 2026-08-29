import * as React from 'react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { Loader2, type LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

export const Menu = DropdownMenuPrimitive.Root
export const MenuTrigger = DropdownMenuPrimitive.Trigger
export const MenuGroup = DropdownMenuPrimitive.Group

export const MenuContent = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(function MenuContent({ className, sideOffset = 6, children, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        data-as="menu"
        sideOffset={sideOffset}
        collisionPadding={8}
        className={cn(
          'as-anim-pop z-[var(--as-z-popover)] min-w-40 overflow-hidden rounded-[var(--as-radius-lg)] border border-[var(--as-border)] bg-[var(--as-surface-raised)] p-1 text-[var(--as-fg)] shadow-[var(--as-shadow-3)]',
          className,
        )}
        {...props}
      >
        {children}
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  )
})

export interface MenuItemProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> {
  icon?: LucideIcon
  danger?: boolean
  pending?: boolean
}

export const MenuItem = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Item>,
  MenuItemProps
>(function MenuItem({ className, icon: Icon, danger, pending, disabled, children, ...props }, ref) {
  const SpinnerIcon = pending ? Loader2 : null
  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      className={cn(
        'flex w-full cursor-pointer select-none items-center gap-2 rounded-[calc(var(--as-radius-sm)-2px)] px-2 py-1.5 text-left text-sm outline-none transition-colors focus:bg-[var(--as-secondary)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
        danger && 'text-[var(--as-danger)] focus:bg-[var(--as-danger)]/10',
        className,
      )}
      {...props}
    >
      {SpinnerIcon ? (
        <SpinnerIcon className="animate-spin" aria-hidden />
      ) : Icon ? (
        <Icon aria-hidden />
      ) : null}
      {children}
    </DropdownMenuPrimitive.Item>
  )
})

export const MenuSeparator = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(function MenuSeparator({ className, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.Separator
      ref={ref}
      className={cn('-mx-1 my-1 h-px bg-[var(--as-border)]', className)}
      {...props}
    />
  )
})

export const MenuLabel = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>
>(function MenuLabel({ className, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.Label
      ref={ref}
      className={cn('px-2 py-1.5 text-xs font-medium text-[var(--as-muted-fg)]', className)}
      {...props}
    />
  )
})

export interface ActionMenuItem {
  key: string
  label: string
  icon?: LucideIcon
  danger?: boolean
  disabled?: boolean
  pending?: boolean
  onSelect: () => void
}

export interface ActionMenuProps {
  label: string
  trigger: React.ReactNode
  items: ActionMenuItem[]
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
  triggerClassName?: string
  panelClassName?: string
  disabled?: boolean
}

export function ActionMenu({
  label,
  trigger,
  items,
  align = 'end',
  side = 'bottom',
  triggerClassName,
  panelClassName,
  disabled = false,
}: ActionMenuProps) {
  return (
    <Menu modal={false}>
      <MenuTrigger
        type="button"
        aria-label={label}
        disabled={disabled}
        className={cn(
          'inline-flex cursor-pointer items-center justify-center gap-1 rounded-full transition-colors hover:bg-[var(--as-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)] disabled:pointer-events-none disabled:opacity-50',
          triggerClassName ?? 'size-9',
        )}
      >
        {trigger}
      </MenuTrigger>
      <MenuContent align={align} side={side} className={cn('w-52 p-1', panelClassName)}>
        <div className="flex flex-col">
          {items.map((item) => (
            <MenuItem
              key={item.key}
              icon={item.icon}
              danger={item.danger}
              disabled={item.disabled}
              pending={item.pending}
              onSelect={() => item.onSelect()}
            >
              {item.label}
            </MenuItem>
          ))}
        </div>
      </MenuContent>
    </Menu>
  )
}
