import * as React from 'react'
import type { ThemeTokens } from '../../tokens/tokens'

export interface ThemeScopeProps extends React.ComponentProps<'div'> {
  tokens?: ThemeTokens
}

export const ThemeScope = React.forwardRef<HTMLDivElement, ThemeScopeProps>(
  function ThemeScope({ tokens, style, children, ...props }, ref) {
    const tokenStyle = tokens ? ({ ...tokens } as React.CSSProperties) : undefined
    return (
      <div
        ref={ref}
        data-as="theme-scope"
        style={{ ...tokenStyle, ...style }}
        {...props}
      >
        {children}
      </div>
    )
  },
)
