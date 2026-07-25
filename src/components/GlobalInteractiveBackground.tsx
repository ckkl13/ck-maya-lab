import { useRef, type CSSProperties } from 'react'
import { usePointerField } from '../hooks/usePointerField'

const particles = [
  { x: 8, y: 14, depth: 'far', line: 88, angle: 18 },
  { x: 22, y: 34, depth: 'near', line: 64, angle: -28 },
  { x: 38, y: 18, depth: 'mid', line: 92, angle: 34 },
  { x: 54, y: 39, depth: 'far', line: 70, angle: -12 },
  { x: 73, y: 17, depth: 'near', line: 82, angle: 24 },
  { x: 91, y: 31, depth: 'mid', line: 58, angle: 138 },
  { x: 13, y: 68, depth: 'mid', line: 76, angle: -18 },
  { x: 31, y: 82, depth: 'far', line: 96, angle: 12 },
  { x: 48, y: 63, depth: 'near', line: 68, angle: 42 },
  { x: 66, y: 78, depth: 'mid', line: 84, angle: -24 },
  { x: 84, y: 61, depth: 'far', line: 72, angle: 18 },
  { x: 95, y: 86, depth: 'near', line: 54, angle: 152 },
]

export function GlobalInteractiveBackground() {
  const scope = useRef<HTMLDivElement>(null)
  usePointerField(scope, { viewport: true })

  return (
    <div ref={scope} className="global-interactive-background" aria-hidden="true">
      <div className="global-light-field" />
      <div className="global-grid global-grid-far" />
      <div className="global-grid global-grid-near" />
      <div className="global-particle-field">
        {particles.map((particle, index) => (
          <span
            key={`${particle.x}-${particle.y}`}
            className={`global-particle global-particle-${particle.depth}`}
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              '--particle-line': `${particle.line}px`,
              '--particle-angle': `${particle.angle}deg`,
              '--particle-delay': `${index * 0.04}s`,
            } as CSSProperties}
          />
        ))}
      </div>
    </div>
  )
}
