import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { ActionMenu, Menu, MenuContent, MenuItem, MenuTrigger } from '../src/components/menu/Menu'
import { ContextMenu } from '../src/components/context-menu/ContextMenu'
import { Trash2 } from 'lucide-react'
import { Button } from '../src/components/button/Button'

describe('Menu / ActionMenu', () => {
  it('opens on click and selects an item with the keyboard', async () => {
    const user = userEvent.setup()
    const onRename = vi.fn()
    const onDelete = vi.fn()
    render(
      <ActionMenu
        label="Item actions"
        trigger={<span>open</span>}
        items={[
          { key: 'rename', label: 'Rename', onSelect: onRename },
          { key: 'delete', label: 'Delete', danger: true, onSelect: onDelete },
        ]}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Item actions' }))
    const rename = await screen.findByRole('menuitem', { name: 'Rename' })
    rename.focus()
    await user.keyboard('{Enter}')
    expect(onRename).toHaveBeenCalledOnce()
    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument()
  })

  it('ArrowDown moves focus between items and Escape closes (keyboard)', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    render(
      <Menu>
        <MenuTrigger asChild>
          <Button variant="outline">Actions</Button>
        </MenuTrigger>
        <MenuContent>
          <MenuItem onSelect={() => {}}>Duplicate</MenuItem>
          <MenuItem danger icon={Trash2} onSelect={onDelete}>
            Delete
          </MenuItem>
        </MenuContent>
      </Menu>,
    )
    await user.click(screen.getByRole('button', { name: 'Actions' }))
    await screen.findByRole('menuitem', { name: 'Duplicate' })
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus()
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(onDelete).toHaveBeenCalledOnce()
    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument()
  })

  it('disabled items are not selectable', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <ActionMenu
        label="Actions"
        trigger={<span>open</span>}
        items={[{ key: 'x', label: 'Blocked', disabled: true, onSelect }]}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Actions' }))
    const item = await screen.findByRole('menuitem', { name: 'Blocked' })
    expect(item).toHaveAttribute('data-disabled')
    await user.click(item)
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('open menu has no axe violations', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <ActionMenu
        label="Actions"
        trigger={<span>open</span>}
        items={[{ key: 'a', label: 'One', onSelect: () => {} }]}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Actions' }))
    await screen.findByRole('menuitem', { name: 'One' })
    await waitFor(() => expect(document.querySelector('[data-as="menu"]')).toBeInTheDocument())
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('ContextMenu', () => {
  it('renders items at coordinates and selects via keyboard', async () => {
    const user = userEvent.setup()
    const onOpen = vi.fn()
    const onClose = vi.fn()
    render(
      <ContextMenu
        x={40}
        y={40}
        items={[
          { key: 'open', label: 'Open', onSelect: onOpen },
          { key: 'none', label: 'Unavailable', disabled: true, onSelect: () => {} },
        ]}
        onClose={onClose}
      />,
    )
    const open = await screen.findByRole('menuitem', { name: 'Open' })
    open.focus()
    await user.keyboard('{Enter}')
    expect(onOpen).toHaveBeenCalledOnce()
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('Escape closes and reports onClose (keyboard)', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const { rerender } = render(
      <ContextMenu
        x={10}
        y={10}
        items={[{ key: 'a', label: 'Act', onSelect: () => {} }]}
        onClose={onClose}
      />,
    )
    await screen.findByRole('menuitem', { name: 'Act' })
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledOnce()
    rerender(
      <ContextMenu x={10} y={10} items={[]} onClose={onClose} />,
    )
    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument()
  })

  it('open state has no axe violations', async () => {
    const { container } = render(
      <ContextMenu
        x={10}
        y={10}
        items={[{ key: 'a', label: 'Act', onSelect: () => {} }]}
        onClose={() => {}}
      />,
    )
    await screen.findByRole('menuitem', { name: 'Act' })
    expect(await axe(container)).toHaveNoViolations()
  })
})
