import { useEffect, useRef, type RefObject } from 'react'
import './VariableProximity.css'

type VariableProximityProps = {
  label: string
  containerRef: RefObject<HTMLElement | null>
  className?: string
  radius?: number
}

export function VariableProximity({ label, containerRef, className = '', radius = 130 }: VariableProximityProps) {
  const letters = useRef<Array<HTMLSpanElement | null>>([])

  useEffect(() => {
    const container = containerRef.current
    if (!container || !window.matchMedia('(pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0
    let pointer = { x: -9999, y: -9999 }

    const render = () => {
      frame = 0
      const bounds = container.getBoundingClientRect()
      letters.current.forEach((letter) => {
        if (!letter) return
        const rect = letter.getBoundingClientRect()
        const distance = Math.hypot(pointer.x - (rect.left - bounds.left + rect.width / 2), pointer.y - (rect.top - bounds.top + rect.height / 2))
        const proximity = Math.max(0, 1 - distance / radius)
        const strength = proximity * proximity
        letter.style.fontVariationSettings = `'wght' ${Math.round(420 + strength * 480)}, 'opsz' ${Math.round(14 + strength * 54)}`
        letter.style.letterSpacing = `${strength * 0.024}em`
        letter.style.transform = `translateY(${-strength * 3}px) scale(${1 + strength * 0.045})`
        letter.style.color = strength > 0.12 ? '#efffff' : ''
      })
    }

    const queue = () => {
      if (!frame) frame = requestAnimationFrame(render)
    }
    const onPointerMove = (event: PointerEvent) => {
      const bounds = container.getBoundingClientRect()
      pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
      queue()
    }
    const onPointerLeave = () => {
      pointer = { x: -9999, y: -9999 }
      queue()
    }

    container.addEventListener('pointermove', onPointerMove)
    container.addEventListener('pointerleave', onPointerLeave)
    return () => {
      container.removeEventListener('pointermove', onPointerMove)
      container.removeEventListener('pointerleave', onPointerLeave)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [containerRef, radius])

  return (
    <span className={`variable-proximity ${className}`.trim()} aria-label={label}>
      {Array.from(label).map((letter, index) => (
        <span ref={(node) => { letters.current[index] = node }} className="variable-proximity-letter" aria-hidden="true" key={`${letter}-${index}`}>{letter === ' ' ? '\u00a0' : letter}</span>
      ))}
    </span>
  )
}
