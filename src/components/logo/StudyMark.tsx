import * as React from 'react'
import { cn } from '../../lib/utils'
import { useLogoId, type LogoProps } from './Logo'

const DarkArt = ({ uid }: { uid: string }) => (
  <>
    <defs>
      <linearGradient id={`${uid}-sa-logo-grad`} x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
      <clipPath id={`${uid}-sa-logo-tile`}>
        <rect width="512" height="512" rx="128" />
      </clipPath>
    </defs>
    <rect width="512" height="512" rx="128" fill={`url(#${uid}-sa-logo-grad)`} />
    <g clipPath={`url(#${uid}-sa-logo-tile)`}>
      <path d="M0 0h512v120c-170 52 -342 52 -512 0Z" fill="#ffffff" opacity="0.08" />
    </g>
    <path d="M256 128 400 200 256 272 112 200Z" fill="#ffffff" fillOpacity="0.95" />
    <path d="M168 246.4v68.8c0 9.6 40 36.8 88 36.8s88-27.2 88-36.8v-68.8l-73.6 36.8a32 32 0 0 1-28.8 0Z" fill="#ffffff" fillOpacity="0.75" />
    <path d="M384 217.6v94.4" stroke="#ffffff" strokeOpacity="0.9" strokeWidth="22.4" strokeLinecap="round" />
    <circle cx="384" cy="328" r="19.2" fill="#ffffff" />
  </>
)

export const StudyMark = React.forwardRef<SVGSVGElement, LogoProps>(function StudyMark(
  { size = 32, theme = 'light', title, className, width, height, ...props },
  ref,
) {
  const uid = useLogoId()
  return (
    <svg
      ref={ref}
      data-as="logo"
      data-as-logo="study"
      data-as-theme={theme}
      viewBox="0 0 512 512"
      width={width ?? size}
      height={height ?? size}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      className={cn('block shrink-0', className)}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <DarkArt uid={uid} />
    </svg>
  )
})
