import * as React from 'react'
import { FolderUp, Loader2, Upload } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface UploadDropzoneProps {
  onFiles: (files: File[]) => void
  uploading?: boolean
  variant?: 'block' | 'row'
  label?: string
  hint?: string
  browseLabel?: string
  folderLabel?: string
  accept?: string
  multiple?: boolean
  allowFolders?: boolean
  disabled?: boolean
  className?: string
}

/**
 * Presentational dropzone: drag events and file-picker results go out via
 * `onFiles` — uploading, storage and progress stay app-side. Pass
 * `uploading` to render a busy state and suppress input.
 */
export const UploadDropzone = React.forwardRef<HTMLDivElement, UploadDropzoneProps>(
  function UploadDropzone(
    {
      onFiles,
      uploading = false,
      variant = 'block',
      label = 'Drop files here or click to browse',
      hint,
      browseLabel = 'Choose files',
      folderLabel = 'Choose folder',
      accept,
      multiple = true,
      allowFolders = false,
      disabled = false,
      className,
    },
    ref,
  ) {
    const [dragging, setDragging] = React.useState(false)
    const fileInput = React.useRef<HTMLInputElement>(null)
    const folderInput = React.useRef<HTMLInputElement>(null)

    const active = !disabled && !uploading

    const emit = (list: FileList | null) => {
      if (!active || !list || list.length === 0) return
      onFiles(Array.from(list))
    }

    const input = allowFolders ? (
      <>
        <input
          ref={fileInput}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          aria-hidden
          tabIndex={-1}
          onChange={(event) => {
            emit(event.target.files)
            event.target.value = ''
          }}
        />
        <input
          ref={folderInput}
          type="file"
          multiple
          className="hidden"
          // @ts-expect-error non-standard but universally supported directory picker
          webkitdirectory=""
          aria-hidden
          tabIndex={-1}
          onChange={(event) => {
            emit(event.target.files)
            event.target.value = ''
          }}
        />
      </>
    ) : (
      <input
        ref={fileInput}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        aria-hidden
        tabIndex={-1}
        onChange={(event) => {
          emit(event.target.files)
          event.target.value = ''
        }}
      />
    )

    return (
      <>
        {input}
        <div
          ref={ref}
          data-as="upload-dropzone"
          data-variant={variant}
          data-dragging={dragging || undefined}
          role="button"
          tabIndex={active ? 0 : -1}
          aria-label={label}
          aria-disabled={disabled || uploading || undefined}
          onClick={() => active && fileInput.current?.click()}
          onKeyDown={(event) => {
            if (active && (event.key === 'Enter' || event.key === ' ')) {
              event.preventDefault()
              fileInput.current?.click()
            }
          }}
          onDragOver={(event) => {
            event.preventDefault()
            if (active) setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault()
            setDragging(false)
            emit(event.dataTransfer.files)
          }}
          className={cn(
            'flex cursor-pointer items-center justify-center gap-3 border border-dashed border-[var(--as-border)] bg-[var(--as-surface)] text-[var(--as-muted-fg)] transition-colors',
            'hover:border-[var(--as-primary)] hover:text-[var(--as-fg)]',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)]',
            variant === 'block' ? 'rounded-[var(--as-radius-lg)] p-8' : 'rounded-[var(--as-radius)] px-4 py-3',
            dragging && 'border-[var(--as-primary)] bg-[color-mix(in_srgb,var(--as-primary)_8%,transparent)] text-[var(--as-fg)]',
            uploading && 'cursor-progress opacity-70',
            disabled && 'pointer-events-none opacity-50',
            className,
          )}
        >
          {uploading ? (
            <Loader2 className="size-5 shrink-0 animate-spin" aria-hidden />
          ) : allowFolders ? (
            <FolderUp className="size-5 shrink-0" aria-hidden />
          ) : (
            <Upload className="size-5 shrink-0" aria-hidden />
          )}
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium" role={uploading ? 'status' : undefined}>
              {uploading ? `${browseLabel}…` : dragging ? folderLabel : label}
            </span>
            {hint ? <span className="truncate text-xs">{hint}</span> : null}
          </span>
        </div>
      </>
    )
  },
)
