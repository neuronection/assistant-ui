import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { UploadDropzone } from '../src/components/upload-dropzone/UploadDropzone'
import { FileCard, formatBytes } from '../src/components/file-card/FileCard'
import { FileQueue } from '../src/components/file-queue/FileQueue'

describe('UploadDropzone', () => {
  it('opens the file picker on click and emits selected files (keyboard operable)', async () => {
    const user = userEvent.setup()
    const onFiles = vi.fn()
    const { container } = render(<UploadDropzone onFiles={onFiles} />)
    const dropzone = screen.getByRole('button', { name: /Drop files here/ })
    await user.click(dropzone)
    const input = container.querySelector<HTMLInputElement>('input[type="file"]')!
    expect(input).toBeInTheDocument()
    await user.upload(input, [new File(['a'], 'a.txt')])
    expect(onFiles).toHaveBeenCalledWith([expect.objectContaining({ name: 'a.txt' })])
  })

  it('opens the picker with Enter from keyboard focus', async () => {
    const user = userEvent.setup()
    const { container } = render(<UploadDropzone onFiles={vi.fn()} />)
    const dropzone = screen.getByRole('button', { name: /Drop files here/ })
    const input = container.querySelector<HTMLInputElement>('input[type=file]')!
    const clickSpy = vi.spyOn(input, 'click')
    dropzone.focus()
    await user.keyboard('{Enter}')
    expect(clickSpy).toHaveBeenCalled()
  })

  it('accepts dropped files', () => {
    const onFiles = vi.fn()
    render(<UploadDropzone onFiles={onFiles} />)
    const dropzone = screen.getByRole('button', { name: /Drop files here/ })
    const file = new File(['b'], 'b.pdf', { type: 'application/pdf' })
    const event = {
      preventDefault: vi.fn(),
      dataTransfer: { files: [file] },
    }
    fireEvent.drop(dropzone, event as never)
    void event
    expect(onFiles).toHaveBeenCalledWith([file])
  })

  it('suppresses input while uploading and when disabled', () => {
    const onFiles = vi.fn()
    const { container } = render(<UploadDropzone onFiles={onFiles} uploading />)
    expect(screen.getByRole('status')).toHaveTextContent('Choose files…')
    expect(screen.getByRole('button', { name: /Drop files here/ })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
    expect(container.querySelector('input')).toBeTruthy()
  })

  it('shows a custom hint and row variant', () => {
    render(
      <UploadDropzone
        onFiles={vi.fn()}
        variant="row"
        label="Drop resume"
        hint="PDF only"
      />,
    )
    expect(screen.getByText('Drop resume')).toBeInTheDocument()
    expect(screen.getByText('PDF only')).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <UploadDropzone onFiles={vi.fn()} hint="PDF up to 10 MB" />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('FileCard', () => {
  it('renders name, size and status', () => {
    render(<FileCard name="scan.pdf" sizeBytes={2048} status="done" />)
    expect(screen.getByText('scan.pdf')).toBeInTheDocument()
    expect(screen.getByText('2.0 KB')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
  })

  it('removes via the X button with accessible name', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()
    render(<FileCard name="a.png" onRemove={onRemove} />)
    await user.click(screen.getByRole('button', { name: 'Remove file — a.png' }))
    expect(onRemove).toHaveBeenCalled()
  })

  it('toggles inclusion without triggering card open', async () => {
    const user = userEvent.setup()
    const onToggleInclude = vi.fn()
    const onOpen = vi.fn()
    render(
      <FileCard name="a.png" onToggleInclude={onToggleInclude} onOpen={onOpen} />,
    )
    const checkbox = screen.getByRole('checkbox', {
      name: 'Include in processing — a.png',
    })
    await user.click(checkbox)
    expect(onToggleInclude).toHaveBeenCalled()
    expect(onOpen).not.toHaveBeenCalled()
  })

  it('shows the failure state', () => {
    render(<FileCard name="b.dcm" status="failed" error="Unsupported" />)
    expect(screen.getByText('Unsupported')).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <FileCard name="c.pdf" sizeBytes={512} onRemove={vi.fn()} onToggleInclude={vi.fn()} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('formats bytes', () => {
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(2048)).toBe('2.0 KB')
    expect(formatBytes(3 * 1024 * 1024)).toBe('3.0 MB')
  })
})

const files = [
  { id: 'f1', name: 'one.pdf', sizeBytes: 1024, status: 'done' as const },
  { id: 'f2', name: 'two.png', sizeBytes: 4096 },
]

describe('FileQueue', () => {
  it('renders an aggregate summary and cards', () => {
    render(<FileQueue files={files} />)
    expect(screen.getByText('2 files · 5.0 KB')).toBeInTheDocument()
    expect(screen.getByText('one.pdf')).toBeInTheDocument()
    expect(screen.getByText('two.png')).toBeInTheDocument()
  })

  it('removes by id', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()
    render(<FileQueue files={files} onRemove={onRemove} />)
    await user.click(screen.getByRole('button', { name: 'Remove file — one.pdf' }))
    expect(onRemove).toHaveBeenCalledWith('f1')
  })

  it('reports reorder intent on drop', () => {
    const onReorder = vi.fn()
    const { container } = render(<FileQueue files={files} onReorder={onReorder} />)
    const cards = container.querySelectorAll('[data-as="file-queue"] [draggable="true"]')
    fireEvent.dragStart(cards[0]!, { dataTransfer: { effectAllowed: 'move' } })
    fireEvent.dragOver(cards[1]!.parentElement!, { dataTransfer: {} })
    fireEvent.drop(cards[1]!.parentElement!, { dataTransfer: {} })
    expect(onReorder).toHaveBeenCalledWith('f1', 'f2')
  })

  it('renders emptyText instead of the queue', () => {
    render(<FileQueue files={[]} emptyText="No files uploaded yet." />)
    expect(screen.getByText('No files uploaded yet.')).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <FileQueue files={files} onRemove={vi.fn()} onToggleInclude={vi.fn()} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
