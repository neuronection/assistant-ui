import * as React from 'react'
import { cn } from '../../lib/utils'
import { useLogoId, type LogoProps } from './Logo'

const BrandArt = ({ uid }: { uid: string }) => (
  <>
    <defs>
      <linearGradient id={`${uid}-da-logo-grad`} x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>
      <clipPath id={`${uid}-da-logo-tile`}>
        <rect width="512" height="512" rx="128" />
      </clipPath>
    </defs>
    <rect width="512" height="512" rx="128" fill={`url(#${uid}-da-logo-grad)`} />
    <g clipPath={`url(#${uid}-da-logo-tile)`}>
      <path d="M0 0h512v120c-170 52 -342 52 -512 0Z" fill="#ffffff" opacity="0.08" />
    </g>
    <rect x="116" y="140" width="280" height="180" rx="24" fill="#ffffff" fillOpacity="0.95" />
    <rect x="140" y="164" width="232" height="132" rx="12" fill="#0f172a" fillOpacity="0.92" />
    <path d="M170 206h140M170 236h108M170 266h76" stroke="#22d3ee" strokeWidth="14" strokeLinecap="round" opacity="0.95" />
    <path d="M216 320h80l40 56H176Z" fill="#ffffff" fillOpacity="0.95" />
    <rect x="150" y="384" width="212" height="20" rx="10" fill="#ffffff" fillOpacity="0.95" />
    <path d="M326 196c0-10 8-18 18-18h52c10 0 18 8 18 18v32c0 10-8 18-18 18h-24l-18 16v-16h-10c-10 0-18-8-18-18Z" fill="#22d3ee" />
    <circle cx="366" cy="212" r="5" fill="#0f172a" />
  </>
)

export const DesktopMark = React.forwardRef<SVGSVGElement, LogoProps>(function DesktopMark(
  { size = 32, theme = 'light', title, className, width, height, ...props },
  ref,
) {
  const uid = useLogoId()
  return (
    <svg
      ref={ref}
      data-as="logo"
      data-as-logo="desktop"
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
      <BrandArt uid={uid} />
    </svg>
  )
})
