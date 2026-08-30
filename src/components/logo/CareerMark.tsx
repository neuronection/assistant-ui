import * as React from 'react'
import { cn } from '../../lib/utils'
import { useLogoId, type LogoProps } from './Logo'

const DarkArt = ({ uid }: { uid: string }) => (
  <>
    <defs>
      <linearGradient id={`${uid}-bgGradD`} x1="0" y1="0" x2="192" y2="192" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0F172A" />
        <stop offset="1" stopColor="#1E293B" />
      </linearGradient>
      <linearGradient id={`${uid}-borderGradD`} x1="0" y1="0" x2="192" y2="192" gradientUnits="userSpaceOnUse">
        <stop stopColor="#60A5FA" stopOpacity="0.45" />
        <stop offset="1" stopColor="#A78BFA" stopOpacity="0.2" />
      </linearGradient>
      <linearGradient id={`${uid}-routeGradD`} x1="90" y1="124" x2="137" y2="62" gradientUnits="userSpaceOnUse">
        <stop stopColor="#60A5FA" />
        <stop offset="1" stopColor="#A78BFA" />
      </linearGradient>
      <linearGradient id={`${uid}-caseGradD`} x1="34" y1="152" x2="86" y2="106" gradientUnits="userSpaceOnUse">
        <stop stopColor="#60A5FA" />
        <stop offset="1" stopColor="#A78BFA" />
      </linearGradient>
      <filter id={`${uid}-glowD`} x="-50%" y="-50%" width="200%" height="200%" filterUnits="userSpaceOnUse">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <rect x="2" y="2" width="188" height="188" rx="44" fill={`url(#${uid}-bgGradD)`} stroke={`url(#${uid}-borderGradD)`} strokeWidth="3" />
    <path d="M90 124 C112 116 120 94 137 62" stroke={`url(#${uid}-routeGradD)`} strokeWidth="7.5" strokeLinecap="round" strokeDasharray="14 14" strokeDashoffset="-9.71" fill="none" filter={`url(#${uid}-glowD)`} opacity="0.95" />
    <path d="M49 120 v-4 a6.5 6.5 0 0 1 6.5-6.5 h9 a6.5 6.5 0 0 1 6.5 6.5 v4" stroke={`url(#${uid}-caseGradD)`} strokeWidth="6" strokeLinecap="round" fill="none" />
    <rect x="34" y="120" width="52" height="32" rx="9" fill={`url(#${uid}-caseGradD)`} />
    <path d="M37 128 H83" stroke="#0F172A" strokeOpacity="0.5" strokeWidth="3" strokeLinecap="round" />
    <rect x="54" y="123.5" width="12" height="9" rx="3" fill="#0F172A" fillOpacity="0.9" />
    <path d="M54 39 Q55.6 46.4 62 48 Q55.6 49.6 54 57 Q52.4 49.6 46 48 Q52.4 46.4 54 39 Z" fill="#A78BFA" fillOpacity="0.8" />
    <path d="M146 30 Q149.5 44.5 164 48 Q149.5 51.5 146 66 Q142.5 51.5 128 48 Q142.5 44.5 146 30 Z" fill="#34D399" />
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
        <stop stopColor="#3B82F6" stopOpacity="0.35" />
        <stop offset="1" stopColor="#8B5CF6" stopOpacity="0.15" />
      </linearGradient>
      <linearGradient id={`${uid}-routeGrad`} x1="90" y1="124" x2="137" y2="62" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3B82F6" />
        <stop offset="1" stopColor="#8B5CF6" />
      </linearGradient>
      <linearGradient id={`${uid}-caseGrad`} x1="34" y1="152" x2="86" y2="106" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3B82F6" />
        <stop offset="1" stopColor="#8B5CF6" />
      </linearGradient>
      <filter id={`${uid}-glow`} x="-50%" y="-50%" width="200%" height="200%" filterUnits="userSpaceOnUse">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <rect x="2" y="2" width="188" height="188" rx="44" fill={`url(#${uid}-bgGrad)`} stroke={`url(#${uid}-borderGrad)`} strokeWidth="3" />
    <path d="M90 124 C112 116 120 94 137 62" stroke={`url(#${uid}-routeGrad)`} strokeWidth="7.5" strokeLinecap="round" strokeDasharray="14 14" strokeDashoffset="-9.71" fill="none" filter={`url(#${uid}-glow)`} opacity="0.9" />
    <path d="M49 120 v-4 a6.5 6.5 0 0 1 6.5-6.5 h9 a6.5 6.5 0 0 1 6.5 6.5 v4" stroke={`url(#${uid}-caseGrad)`} strokeWidth="6" strokeLinecap="round" fill="none" />
    <rect x="34" y="120" width="52" height="32" rx="9" fill={`url(#${uid}-caseGrad)`} />
    <path d="M37 128 H83" stroke="#FFFFFF" strokeOpacity="0.5" strokeWidth="3" strokeLinecap="round" />
    <rect x="54" y="123.5" width="12" height="9" rx="3" fill="#FFFFFF" fillOpacity="0.9" />
    <path d="M54 39 Q55.6 46.4 62 48 Q55.6 49.6 54 57 Q52.4 49.6 46 48 Q52.4 46.4 54 39 Z" fill="#8B5CF6" fillOpacity="0.65" />
    <path d="M146 30 Q149.5 44.5 164 48 Q149.5 51.5 146 66 Q142.5 51.5 128 48 Q142.5 44.5 146 30 Z" fill="#10B981" />
  </>
)

export const CareerMark = React.forwardRef<SVGSVGElement, LogoProps>(function CareerMark(
  { size = 32, theme = 'light', title, className, width, height, ...props },
  ref,
) {
  const uid = useLogoId()
  return (
    <svg
      ref={ref}
      data-as="logo"
      data-as-logo="career"
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
