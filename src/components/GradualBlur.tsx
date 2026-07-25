import { useMemo, type CSSProperties } from 'react'
import './GradualBlur.css'

type BlurPosition = 'top' | 'bottom'
type BlurCurve = 'linear' | 'bezier' | 'ease-in' | 'ease-out'

type GradualBlurProps = {
  position?: BlurPosition
  height?: string
  strength?: number
  divCount?: number
  exponential?: boolean
  curve?: BlurCurve
  opacity?: number
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
  className = '',
}: GradualBlurProps) {
  const layers = useMemo(() => {
    const count = Math.min(10, Math.max(1, Math.round(divCount)))
    const increment = 100 / count
    const direction = position === 'top' ? 'to top' : 'to bottom'

    return Array.from({ length: count }, (_, layerIndex) => {
      const index = layerIndex + 1
      const progress = curveFunctions[curve](index / count)
      const blur = exponential
        ? 2 ** (progress * 4) * 0.0625 * strength
        : 0.0625 * (progress * count + 1) * strength
      const start = Math.round((increment * index - increment) * 10) / 10
      const solidStart = Math.round(increment * index * 10) / 10
      const solidEnd = Math.min(100, Math.round((increment * index + increment) * 10) / 10)
      const fadeEnd = Math.min(100, Math.round((increment * index + increment * 2) * 10) / 10)
      const mask = `linear-gradient(${direction}, transparent ${start}%, black ${solidStart}%, black ${solidEnd}%, transparent ${fadeEnd}%)`

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
      className={`gradual-blur gradual-blur-${position} ${className}`.trim()}
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
