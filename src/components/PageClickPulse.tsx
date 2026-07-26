import { useEffect, useRef } from 'react'
import './PageClickPulse.css'

export function PageClickPulse() {
  const scope = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = scope.current
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return
      const pulse = document.createElement('i')
      pulse.className = 'page-click-pulse-ring'
      pulse.style.setProperty('--pulse-x', `${event.clientX}px`)
      pulse.style.setProperty('--pulse-y', `${event.clientY}px`)
      root.appendChild(pulse)
      pulse.addEventListener('animationend', () => pulse.remove(), { once: true })
    }

    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [])

  return <div ref={scope} className="page-click-pulses" aria-hidden="true" />
}
