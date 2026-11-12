import * as React from 'react'
import {
  Check,
  Database,
  Eye,
  Mic,
  Scale,
  Type,
  Volume2,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { SwitchRow } from '../switch-row/SwitchRow'

/** One curated model card (capability icons render from `caps`). */
export interface SetupReviewModel {
  id: string
  name: string
  caps?: string[]
  selected: boolean
}

/** The five-bind option keys of the §15 options body (camelCase — desktop
 * IPC; Python apps convert to snake_case app-side). */
export type SetupReviewOptionsKey =
  | 'bindChat'
  | 'bindVision'
  | 'bindStt'
  | 'bindDecision'

/** One gap-fill switch. Pass one slot per `optionsKey` — chat presets show
 * text/vision/stt slots, decision-only presets show the decision slot only;
 * the current value of every slot the bind would fill rides `currentValue`. */
export interface SetupReviewSlot {
  id: string
  label: string
  bind: boolean
  currentValue?: string
  optionsKey: SetupReviewOptionsKey
}

/** The options body a setup run carries (plan 26 D14) — `curatedIds` in the
 * order the cards are given, one bind flag per capability group. */
export interface SetupReviewOptions {
  curatedIds: string[]
  bindChat: boolean
  bindVision: boolean
  bindStt: boolean
  bindDecision: boolean
}

const DEFAULT_CAP_ICONS: Record<string, LucideIcon> = {
  text: Type,
  vision: Eye,
  tools: Wrench,
  stt: Mic,
  tts: Volume2,
  embeddings: Database,
  decision: Scale,
}

export interface SetupReviewProps extends React.ComponentProps<'div'> {
  models: SetupReviewModel[]
  slots: SetupReviewSlot[]
  /** Emits the full options body on every card/switch edit — controlled:
   * feed the changed state back through `models`/`slots`. */
  onOptionsChange: (options: SetupReviewOptions) => void
  /** Per-capability icon override (capability string → icon). */
  capIcons?: Partial<Record<string, LucideIcon>>
  modelsLabel?: string
  footnote?: string
}

/** Editable pre-flight review (plan 26 §6): model-select cards with
 * capability icons plus gap-fill switch rows with `now:` sub-lines and the
 * never-removes footnote. Emits the five-bind options body
 * `{curatedIds, bindChat, bindVision, bindStt, bindDecision}` — append
 * semantics mean nothing existing is ever removed. */
export const SetupReview = React.forwardRef<HTMLDivElement, SetupReviewProps>(
  function SetupReview(
    {
      models,
      slots,
      onOptionsChange,
      capIcons,
      modelsLabel = 'Models to save',
      footnote = 'Existing assignments and models are never removed.',
      className,
      ...props
    },
    ref,
  ) {
    const icons = { ...DEFAULT_CAP_ICONS, ...capIcons }
    const body = (
      curatedIds: string[],
      slotOverrides: Partial<Record<SetupReviewOptionsKey, boolean>> = {},
    ): SetupReviewOptions => ({
      curatedIds,
      bindChat: slotOverrides.bindChat ?? slots.some((slot) => slot.optionsKey === 'bindChat' && slot.bind),
      bindVision: slotOverrides.bindVision ?? slots.some((slot) => slot.optionsKey === 'bindVision' && slot.bind),
      bindStt: slotOverrides.bindStt ?? slots.some((slot) => slot.optionsKey === 'bindStt' && slot.bind),
      bindDecision: slotOverrides.bindDecision ?? slots.some((slot) => slot.optionsKey === 'bindDecision' && slot.bind),
    })

    const toggleModel = (id: string): void => {
      const next = models.filter(
        (model) => model.selected !== (model.id === id),
      )
      onOptionsChange(body(next.map((model) => model.id)))
    }

    const toggleSlot = (slot: SetupReviewSlot): void => {
      onOptionsChange(
        body(
          models.filter((model) => model.selected).map((model) => model.id),
          { [slot.optionsKey]: !slot.bind },
        ),
      )
    }

    return (
      <div
        ref={ref}
        data-as="setup-review"
        className={cn('flex w-full flex-col gap-4', className)}
        {...props}
      >
        {models.length > 0 ? (
          <div
            role="group"
            aria-label={modelsLabel}
            className="grid grid-cols-1 gap-2 sm:grid-cols-2"
          >
            {models.map((model) => {
              const selected = model.selected
              const caps = model.caps ?? []
              return (
                <button
                  key={model.id}
                  type="button"
                  aria-pressed={selected}
                  data-model-id={model.id}
                  onClick={() => toggleModel(model.id)}
                  className={cn(
                    'flex cursor-pointer items-center justify-between gap-2 rounded-[var(--as-radius)] border px-3 py-2 text-left text-sm text-[var(--as-fg)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--as-focus-ring)]',
                    selected
                      ? 'border-[var(--as-focus-ring)] bg-[var(--as-muted)]'
                      : 'border-[var(--as-border)] opacity-70 hover:opacity-100',
                  )}
                >
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="truncate font-medium">{model.name}</span>
                    {caps.length > 0 ? (
                      <span className="flex items-center gap-2 text-xs text-[var(--as-muted-fg)]">
                        {caps.map((cap) => {
                          const Icon = icons[cap]
                          return Icon ? (
                            <Icon key={cap} className="size-3.5" aria-hidden />
                          ) : null
                        })}
                      </span>
                    ) : null}
                  </span>
                  {selected ? (
                    <Check className="size-4 shrink-0" aria-hidden />
                  ) : null}
                </button>
              )
            })}
          </div>
        ) : null}

        {slots.length > 0 ? (
          <div className="flex flex-col gap-2">
            {slots.map((slot) => (
              <SwitchRow
                key={slot.id}
                label={slot.label}
                checked={slot.bind}
                currentValue={slot.currentValue}
                onCheckedChange={() => toggleSlot(slot)}
              />
            ))}
          </div>
        ) : null}

        <p className="text-xs text-[var(--as-muted-fg)]">{footnote}</p>
      </div>
    )
  },
)
