import { useRef, type MouseEvent, type PropsWithChildren } from 'react'

interface SpotlightPanelProps extends PropsWithChildren {
  className?: string
  color?: string
}

export function SpotlightPanel({ children, className = '', color = 'rgba(70, 215, 197, 0.14)' }: SpotlightPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  const updateSpotlight = (event: MouseEvent<HTMLDivElement>) => {
    const panel = panelRef.current
    if (!panel) return
    const rect = panel.getBoundingClientRect()
    panel.style.setProperty('--spot-x', `${event.clientX - rect.left}px`)
    panel.style.setProperty('--spot-y', `${event.clientY - rect.top}px`)
    panel.style.setProperty('--spot-color', color)
  }

  return (
    <div ref={panelRef} className={`spotlight-panel ${className}`} onMouseMove={updateSpotlight}>
      {children}
    </div>
  )
}
