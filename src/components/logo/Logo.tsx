import * as React from 'react'

export type LogoTheme = 'light' | 'dark'

export interface LogoProps extends Omit<React.ComponentProps<'svg'>, 'children'> {
  size?: number | string
  theme?: LogoTheme
  title?: string
}

export const useLogoId = () => React.useId().replace(/:/g, '')
