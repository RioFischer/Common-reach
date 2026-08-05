import * as React from 'react'

export type IconName =
  | 'childcare'
  | 'clothing'
  | 'crisis'
  | 'disability'
  | 'education'
  | 'employment'
  | 'financial'
  | 'food'
  | 'housing'
  | 'legal-aid'
  | 'medical'
  | 'mental-health'
  | 'recovery'
  | 'senior'
  | 'transportation'

const PATHS: Record<IconName, React.ReactNode> = {
  'childcare': (
    <><circle cx="8.5" cy="6.5" r="2.8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></circle><path d="M4.5 19 V16.5 C4.5 13.6 6.3 12 8.5 12 C10.7 12 12.5 13.6 12.5 16.5 V19" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path><circle cx="16" cy="9" r="2.1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></circle><path d="M13 19 V16.2 C13 14 14.3 13 16 13 C17.7 13 19 14 19 16.2 V19" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path></>
  ),
  'clothing': (
    <><path d="M8 4 L4.5 6.5 L2.5 9.2 L5.8 11.2 L7 9.8 V20 H17 V9.8 L18.2 11.2 L21.5 9.2 L19.5 6.5 L16 4 C16 4 14.7 5.6 12 5.6 C9.3 5.6 8 4 8 4 Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path></>
  ),
  'crisis': (
    <><path d="M12 3.8 L21.3 19.4 C21.7 20.1 21.2 21 20.3 21 H3.7 C2.8 21 2.3 20.1 2.7 19.4 Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path><path d="M12 9 V14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path><circle cx="12" cy="17" r="0.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"></circle></>
  ),
  'disability': (
    <><circle cx="11.8" cy="4.4" r="2.1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></circle><path d="M10.6 6.8 L10 12 H14.2 L16.4 14.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path><circle cx="11.4" cy="15.4" r="5.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></circle></>
  ),
  'education': (
    <><path d="M12 4 L22 9 L12 14 L2 9 Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path><path d="M6 11 V15.5 C6 15.5 8.4 17.6 12 17.6 C15.6 17.6 18 15.5 18 15.5 V11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path><path d="M22 9 V13.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path></>
  ),
  'employment': (
    <><rect x="3.5" y="7.5" width="17" height="11.5" rx="2.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></rect><path d="M8.5 7.5 V6.2 A1.6 1.6 0 0 1 10.1 4.6 H13.9 A1.6 1.6 0 0 1 15.5 6.2 V7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path><path d="M3.5 12.5 H20.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path><path d="M11 12.5 V14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path></>
  ),
  'financial': (
    <><ellipse cx="12" cy="7.5" rx="7" ry="2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></ellipse><path d="M5 7.5 V13 C5 14.4 8.1 15.5 12 15.5 C15.9 15.5 19 14.4 19 13 V7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path><path d="M5 10.2 C5 11.6 8.1 12.7 12 12.7 C15.9 12.7 19 11.6 19 10.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path></>
  ),
  'food': (
    <><path d="M6.5 4 V7.2 M8.5 4 V7.2 M10.5 4 V7.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path><path d="M6.5 7.2 H10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path><path d="M8.5 7.2 V20" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path><path d="M16 4 V20" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path><path d="M16 4 C13.5 4.3 13.2 9 16 10.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path></>
  ),
  'housing': (
    <><path d="M3.5 11.5 L12 4.5 L20.5 11.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path><path d="M5.5 10.2 V20 H18.5 V10.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path><path d="M10 20 V14.5 H14 V20" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path></>
  ),
  'legal-aid': (
    <><path d="M12 4.2 V20" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path><path d="M8.5 20 H15.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path><path d="M6 7 H18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path><circle cx="12" cy="4.4" r="1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"></circle><path d="M6 7 L3.7 12 M6 7 L8.3 12 M3.2 12 A2.8 2.8 0 0 0 8.8 12 Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path><path d="M18 7 L15.7 12 M18 7 L20.3 12 M15.2 12 A2.8 2.8 0 0 0 20.8 12 Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path></>
  ),
  'medical': (
    <><rect x="3.5" y="3.5" width="17" height="17" rx="4.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></rect><path d="M12 8 V16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path><path d="M8 12 H16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path></>
  ),
  'mental-health': (
    <><path d="M15.5 20 V17 C18 15.5 19.5 12.9 19.5 10 C19.5 6.4 16.6 3.5 12.8 3.5 C9.4 3.5 6.5 6 6.1 9.3 L4.5 11.8 C4.1 12.4 4.5 13.2 5.2 13.2 H6.3 V15.5 C6.3 16.6 7.2 17.5 8.3 17.5 H9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path><path d="M12.4 12.6 C12.4 12.6 9.9 11.2 9.9 9.5 C9.9 8.7 10.5 8.2 11.2 8.2 C11.8 8.2 12.4 8.7 12.4 8.7 C12.4 8.7 13 8.2 13.6 8.2 C14.3 8.2 14.9 8.7 14.9 9.5 C14.9 11.2 12.4 12.6 12.4 12.6 Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path></>
  ),
  'recovery': (
    <><path d="M12 20 V11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path><path d="M12 14 C12 14 11.2 9.5 6.8 9.5 C6.8 9.5 6.8 14 12 14 Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path><path d="M12 12 C12 12 12.8 7.8 17.2 7.8 C17.2 7.8 17.2 12 12 12 Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path><path d="M7 20 H17" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path></>
  ),
  'senior': (
    <><circle cx="10" cy="4.6" r="2.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></circle><path d="M10 6.8 L9 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path><path d="M9 13 L6.6 19.6 M9 13 L11 19.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path><path d="M10 9 L14 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path><path d="M14.6 8.6 V19.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path><path d="M14.6 8.6 C14.6 7.7 13.7 7.5 13.2 7.9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path></>
  ),
  'transportation': (
    <><rect x="4" y="3.5" width="16" height="14" rx="3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></rect><path d="M5.5 9.5 H18.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path><path d="M7 13.8 H8.5 M15.5 13.8 H17" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"></path><circle cx="8" cy="18.5" r="1.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"></circle><circle cx="16" cy="18.5" r="1.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"></circle></>
  ),
}

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName
  size?: number | string
}

export function Icon({ name, size = 24, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={name.replace(/-/g, ' ')}
      {...props}
    >
      {PATHS[name]}
    </svg>
  )
}

export const ICON_NAMES = Object.keys(PATHS) as IconName[]
export default Icon
