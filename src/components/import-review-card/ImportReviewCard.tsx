import * as React from 'react'
import { Check, FileJson, Loader2, TriangleAlert, Upload } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../button/Button'

export type ImportReviewStatus = 'idle' | 'loading' | 'preview' | 'applied' | 'error'

export interface ImportReviewGroup {
  label: string
  count: number
}

export interface ImportReviewConflict {
  field: string
  current: string
  incoming: string
}

export interface ImportReviewReport {
  groups?: ImportReviewGroup[]
  dropped?: string[]
  warnings?: string[]
  conflicts?: ImportReviewConflict[]
  applied?: boolean
  created?: number
}

export interface ImportReviewLabels {
  choose: string
  apply: string
  applied: string
  drop: string
  warnings: string
  conflicts: string
  mapped: string
  created: string
  invalidFile: string
  fileHint: string
}

const DEFAULT_LABELS: ImportReviewLabels = {
  choose: 'Choose file',
  apply: 'Apply import',
  applied: 'Import applied',
  drop: 'Dropped',
  warnings: 'Review notes',
  conflicts: 'Existing values will be replaced',
  mapped: 'Mapped',
  created: 'Created',
  invalidFile: 'The selected file could not be read',
  fileHint: 'Nothing is written until you apply the import',
}

export interface ImportReviewCardProps
  extends Omit<React.ComponentProps<'section'>, 'onChange' | 'title'> {
  /** Card heading, e.g. "JSON Resume" or "Calendar import". */
  title: string
  description?: string
  accept?: string
  /** App-owned filename shown after selection. */
  fileName?: string | null
  status?: ImportReviewStatus
  report?: ImportReviewReport | null
  error?: string | null
  busy?: boolean
  canApply?: boolean
  labels?: Partial<ImportReviewLabels>
  onFileSelected: (file: File) => void
  onApply?: () => void
  onReset?: () => void
}

const STATUS_ICON = {
  idle: Upload,
  loading: Loader2,
  preview: FileJson,
  applied: Check,
  error: TriangleAlert,
} as const

/**
 * Presentational review-first import card. The app owns file reading,
 * parsing and the API; this component only renders the report and emits
 * `onFileSelected` / `onApply`. Nothing here writes or fetches.
 */
export const ImportReviewCard = React.forwardRef<HTMLElement, ImportReviewCardProps>(
  function ImportReviewCard(
    {
      title,
      description,
      accept,
      fileName,
      status = 'idle',
      report,
      error,
      busy = false,
      canApply = true,
      labels,
      onFileSelected,
      onApply,
      onReset,
      className,
      ...props
    },
    ref,
  ) {
    const copy = { ...DEFAULT_LABELS, ...labels }
    const input = React.useRef<HTMLInputElement>(null)
    const Icon = STATUS_ICON[status]
    const groups = report?.groups ?? []
    const dropped = report?.dropped ?? []
    const warnings = report?.warnings ?? []
    const conflicts = report?.conflicts ?? []
    const applied = report?.applied ?? status === 'applied'
    const showApply = status === 'preview' && !applied

    return (
      <section
        ref={ref}
        data-as="import-review-card"
        data-status={status}
        className={cn(
          'rounded-[var(--as-radius-lg)] border border-[var(--as-border)] bg-[var(--as-surface)] p-4 text-[var(--as-fg)]',
          className,
        )}
        {...props}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Icon
                aria-hidden
                className={cn('size-4 text-[var(--as-accent)]', status === 'loading' && 'animate-spin')}
              />
              {title}
            </h2>
            {description ? (
              <p className="mt-1 max-w-2xl text-xs text-[var(--as-muted-fg)]">{description}</p>
            ) : null}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => input.current?.click()}
            disabled={busy}
            data-testid="import-review-choose"
          >
            <Upload aria-hidden />
            {copy.choose}
          </Button>
        </div>

        <input
          ref={input}
          type="file"
          accept={accept}
          className="hidden"
          data-testid="import-review-file-input"
          aria-hidden
          tabIndex={-1}
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) onFileSelected(file)
            event.target.value = ''
          }}
        />

        {fileName ? (
          <p className="mt-2 truncate text-xs text-[var(--as-muted-fg)]" data-testid="import-review-file">
            {fileName}
          </p>
        ) : (
          <p className="mt-2 text-xs text-[var(--as-muted-fg)]">{copy.fileHint}</p>
        )}

        {error ? (
          <p role="alert" className="mt-2 text-sm text-[var(--as-danger)]" data-testid="import-review-error">
            {error}
          </p>
        ) : null}

        {report ? (
          <div className="mt-3 space-y-2 text-xs" data-testid="import-review-report">
            {groups.length > 0 ? (
              <dl className="grid gap-2 sm:grid-cols-3">
                {groups.map((group) => (
                  <div
                    key={group.label}
                    className="rounded-[var(--as-radius)] border border-[var(--as-border)] p-2"
                  >
                    <dt className="text-[var(--as-muted-fg)]">{group.label}</dt>
                    <dd className="text-base font-semibold tabular-nums">{group.count}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            {conflicts.length > 0 ? (
              <div data-testid="import-review-conflicts">
                <p className="font-medium text-[var(--as-fg)]">{copy.conflicts}</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-5 text-[var(--as-muted-fg)]">
                  {conflicts.map((conflict) => (
                    <li key={conflict.field}>
                      {conflict.field}: “{conflict.current}” → “{conflict.incoming}”
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {dropped.length > 0 ? (
              <p className="text-[var(--as-muted-fg)]" data-testid="import-review-dropped">
                <span className="font-medium text-[var(--as-fg)]">{copy.drop}: </span>
                {dropped.join(', ')}
              </p>
            ) : null}

            {warnings.length > 0 ? (
              <div data-testid="import-review-warnings">
                <p className="font-medium text-[var(--as-fg)]">{copy.warnings}</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-5 text-[var(--as-muted-fg)]">
                  {warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {applied ? (
              <p className="text-[var(--as-success)]" data-testid="import-review-applied">
                {copy.applied}
                {typeof report.created === 'number' ? ` · ${copy.created} ${report.created}` : ''}
              </p>
            ) : null}
          </div>
        ) : null}

        {showApply ? (
          <div className="mt-3 flex justify-end gap-2">
            {onReset ? (
              <Button type="button" variant="ghost" size="sm" onClick={onReset} disabled={busy}>
                {copy.choose}
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              onClick={onApply}
              disabled={busy || !canApply}
              data-testid="import-review-apply"
            >
              {busy ? <Loader2 aria-hidden className="animate-spin" /> : null}
              {copy.apply}
            </Button>
          </div>
        ) : null}
      </section>
    )
  },
)
