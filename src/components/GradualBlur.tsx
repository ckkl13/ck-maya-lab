import { useMemo, type CSSProperties } from 'react'
import './GradualBlur.css'

type BlurPosition = 'top' | 'bottom'
type BlurCurve = 'linear' | 'bezier' | 'ease-in' | 'ease-out'
type BlurTarget = 'page' | 'parent'

type GradualBlurProps = {
  position?: BlurPosition
  height?: string
  strength?: number
  divCount?: number
  exponential?: boolean
  curve?: BlurCurve
  opacity?: number
  target?: BlurTarget
  className?: string
}

const curveFunctions: Record<BlurCurve, (progress: number) => number> = {
  linear: (progress) => progress,
  bezier: (progress) => progress * progress * (3 - 2 * progress),
  'ease-in': (progress) => progress * progress,
  'ease-out': (progress) => 1 - (1 - progress) ** 2,
}

export function GradualBlur({
  position = 'bottom',
  height = '6rem',
  strength = 2,
  divCount = 5,
  exponential = false,
  curve = 'linear',
  opacity = 1,
  target = 'parent',
  className = '',
}: GradualBlurProps) {
  const layers = useMemo(() => {
    const count = Math.min(8, Math.max(1, Math.round(divCount)))
    const direction = position === 'top' ? 'to top' : 'to bottom'

    return Array.from({ length: count }, (_, layerIndex) => {
      const index = layerIndex + 1
      const progress = curveFunctions[curve](index / count)
      const blur = exponential
        ? 2 ** (progress * 3) * 0.014 * strength
        : 0.032 * progress * strength
      const centre = progress * 100
      const fadeStart = Math.max(0, centre - 24)
      const fadeEnd = Math.min(100, centre + 24)
      const mask = `linear-gradient(${direction}, transparent ${fadeStart}%, black ${fadeEnd}%, black 100%)`

      return {
        backdropFilter: `blur(${blur.toFixed(3)}rem)`,
        WebkitBackdropFilter: `blur(${blur.toFixed(3)}rem)`,
        maskImage: mask,
        WebkitMaskImage: mask,
      } as CSSProperties
    })
  }, [curve, divCount, exponential, position, strength])

  return (
    <div
      className={`gradual-blur gradual-blur-${target} gradual-blur-${position} ${className}`.trim()}
      aria-hidden="true"
      style={{
        '--gradual-blur-height': height,
        '--gradual-blur-opacity': opacity,
      } as CSSProperties}
    >
      <div className="gradual-blur-inner">
        {layers.map((style, index) => (
          <span className="gradual-blur-layer" style={style} key={`${position}-${index}`} />
        ))}
      </div>
    </div>
  )
}
