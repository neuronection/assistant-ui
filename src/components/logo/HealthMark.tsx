import * as React from 'react'
import { cn } from '../../lib/utils'
import { useLogoId, type LogoProps } from './Logo'

const DarkArt = ({ uid }: { uid: string }) => (
  <>
    <defs>
      <linearGradient id={`${uid}-bgGrad`} x1="0" y1="0" x2="192" y2="192" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1E293B" />
        <stop offset="1" stopColor="#0F172A" />
      </linearGradient>
      <linearGradient id={`${uid}-borderGrad`} x1="0" y1="0" x2="192" y2="192" gradientUnits="userSpaceOnUse">
        <stop stopColor="#60A5FA" stopOpacity="0.8" />
        <stop offset="1" stopColor="#A78BFA" stopOpacity="0.2" />
      </linearGradient>
      <linearGradient id={`${uid}-pulseGrad`} x1="0" y1="0" x2="192" y2="0" gradientUnits="userSpaceOnUse">
        <stop stopColor="#34D399" />
        <stop offset="0.5" stopColor="#3B82F6" />
        <stop offset="1" stopColor="#8B5CF6" />
      </linearGradient>
      <filter id={`${uid}-glow`} x="-50%" y="-50%" width="200%" height="200%" filterUnits="userSpaceOnUse">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <rect x="2" y="2" width="188" height="188" rx="42" fill={`url(#${uid}-bgGrad)`} stroke={`url(#${uid}-borderGrad)`} strokeWidth="2" />
    <g stroke="white" strokeOpacity="0.05" strokeWidth="1.5">
      <line x1="48" y1="0" x2="48" y2="192" />
      <line x1="96" y1="0" x2="96" y2="192" />
      <line x1="144" y1="0" x2="144" y2="192" />
      <line x1="0" y1="48" x2="192" y2="48" />
      <line x1="0" y1="96" x2="192" y2="96" />
      <line x1="0" y1="144" x2="192" y2="144" />
    </g>
    <path d="M 24 96 L 52 96 L 72 64 L 96 140 L 124 48 L 144 96 L 168 96" stroke={`url(#${uid}-pulseGrad)`} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" filter={`url(#${uid}-glow)`} />
    <circle cx="72" cy="64" r="5" fill="white" />
    <circle cx="96" cy="140" r="5" fill="white" />
    <circle cx="124" cy="48" r="5" fill="white" />
  </>
)

const LightArt = ({ uid }: { uid: string }) => (
  <>
    <defs>
      <linearGradient id={`${uid}-bgGrad`} x1="0" y1="0" x2="192" y2="192" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFFFFF" />
        <stop offset="1" stopColor="#F1F5F9" />
      </linearGradient>
      <linearGradient id={`${uid}-borderGrad`} x1="0" y1="0" x2="192" y2="192" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3B82F6" stopOpacity="0.3" />
        <stop offset="1" stopColor="#8B5CF6" stopOpacity="0.1" />
      </linearGradient>
      <linearGradient id={`${uid}-pulseGrad`} x1="0" y1="0" x2="192" y2="0" gradientUnits="userSpaceOnUse">
        <stop stopColor="#10B981" />
        <stop offset="0.5" stopColor="#3B82F6" />
        <stop offset="1" stopColor="#8B5CF6" />
      </linearGradient>
      <filter id={`${uid}-glow`} x="-50%" y="-50%" width="200%" height="200%" filterUnits="userSpaceOnUse">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <rect x="2" y="2" width="188" height="188" rx="42" fill={`url(#${uid}-bgGrad)`} stroke={`url(#${uid}-borderGrad)`} strokeWidth="2" />
    <g stroke="#0F172A" strokeOpacity="0.05" strokeWidth="1.5">
      <line x1="48" y1="0" x2="48" y2="192" />
      <line x1="96" y1="0" x2="96" y2="192" />
      <line x1="144" y1="0" x2="144" y2="192" />
      <line x1="0" y1="48" x2="192" y2="48" />
      <line x1="0" y1="96" x2="192" y2="96" />
      <line x1="0" y1="144" x2="192" y2="144" />
    </g>
    <path d="M 24 96 L 52 96 L 72 64 L 96 140 L 124 48 L 144 96 L 168 96" stroke={`url(#${uid}-pulseGrad)`} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" filter={`url(#${uid}-glow)`} />
    <circle cx="72" cy="64" r="5" fill="#1E293B" />
    <circle cx="96" cy="140" r="5" fill="#1E293B" />
    <circle cx="124" cy="48" r="5" fill="#1E293B" />
  </>
)

export const HealthMark = React.forwardRef<SVGSVGElement, LogoProps>(function HealthMark(
  { size = 32, theme = 'light', title, className, width, height, ...props },
  ref,
) {
  const uid = useLogoId()
  return (
    <svg
      ref={ref}
      data-as="logo"
      data-as-logo="health"
      data-as-theme={theme}
      viewBox="0 0 192 192"
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
      {theme === 'dark' ? <DarkArt uid={uid} /> : <LightArt uid={uid} />}
    </svg>
  )
})
