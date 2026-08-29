import * as React from 'react'
import { cn } from '../../lib/utils'

export interface TableProps extends React.ComponentProps<'div'> {
  headers: string[]
  rows: React.ReactNode[][]
  emptyText?: string
}

export const Table = React.forwardRef<HTMLDivElement, TableProps>(
  function Table({ headers, rows, emptyText = 'Nothing here yet', className, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-as="table"
        className={cn('overflow-x-auto', className)}
        {...props}
      >
        <table className="min-w-full divide-y divide-[var(--as-border)]">
          <thead className="bg-[var(--as-muted)]">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  scope="col"
                  className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-[var(--as-muted-fg)]"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[color-mix(in_srgb,var(--as-border)_55%,transparent)] bg-[var(--as-surface-raised)]">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-4 py-6 text-center text-sm text-[var(--as-muted-fg)]"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="transition-colors hover:bg-[color-mix(in_srgb,var(--as-muted)_60%,transparent)]"
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="whitespace-nowrap px-4 py-3 text-sm text-[var(--as-fg)]"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    )
  },
)
