import { useEffect, useRef, type PointerEvent, type ReactNode } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import './TiltedCard.css'

interface TiltedCardProps {
  className?: string
  imageSrc: string
  altText: string
  rotateAmplitude?: number
  scaleOnHover?: number
  onActiveChange?: (active: boolean) => void
  overlay?: ReactNode
  imageClassName?: string
  focusable?: boolean
  imageLoading?: 'eager' | 'lazy'
}

const spring = { damping: 24, stiffness: 180, mass: 0.55 }

export function TiltedCard({
  className = '',
  imageSrc,
  altText,
  rotateAmplitude = 7,
  scaleOnHover = 1.05,
  onActiveChange,
  overlay,
  imageClassName = '',
  focusable = true,
  imageLoading = 'lazy',
}: TiltedCardProps) {
  const ref = useRef<HTMLElement>(null)
  const active = useRef(false)
  const bounds = useRef<DOMRect | null>(null)
  const pointer = useRef({ x: 0, y: 0 })
  const frame = useRef(0)
  const reduceMotion = useReducedMotion() ?? false
  const tiltX = useMotionValue(0)
  const tiltY = useMotionValue(0)
  const rotateX = useSpring(tiltY, spring)
  const rotateY = useSpring(tiltX, spring)
  const scale = useSpring(1, spring)

  useEffect(() => () => {
    if (frame.current) cancelAnimationFrame(frame.current)
  }, [])

  const renderPointer = () => {
    frame.current = 0
    const element = ref.current
    const rect = bounds.current
    if (!element || !rect) return
    const normalizedX = Math.max(-1, Math.min(1, (pointer.current.x - rect.left - rect.width / 2) / (rect.width / 2)))
    const normalizedY = Math.max(-1, Math.min(1, (pointer.current.y - rect.top - rect.height / 2) / (rect.height / 2)))
    tiltY.set(normalizedY * -rotateAmplitude)
    tiltX.set(normalizedX * rotateAmplitude)
    element.style.setProperty('--tilt-light-x', `${(normalizedX + 1) * 50}%`)
    element.style.setProperty('--tilt-light-y', `${(normalizedY + 1) * 50}%`)
    element.style.setProperty('--tilt-image-x', `${normalizedX * -5}px`)
    element.style.setProperty('--tilt-image-y', `${normalizedY * -4}px`)
  }

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (reduceMotion || event.pointerType !== 'mouse' || !ref.current) return
    pointer.current = { x: event.clientX, y: event.clientY }
    if (!bounds.current) bounds.current = ref.current.getBoundingClientRect()
    if (!frame.current) frame.current = requestAnimationFrame(renderPointer)
    activate()
  }

  const activate = () => {
    if (active.current) return
    active.current = true
    ref.current?.classList.add('is-pointer-active')
    if (!reduceMotion) scale.set(scaleOnHover)
    onActiveChange?.(true)
  }

  const deactivate = () => {
    if (!active.current) return
    active.current = false
    bounds.current = null
    if (frame.current) cancelAnimationFrame(frame.current)
    frame.current = 0
    ref.current?.classList.remove('is-pointer-active')
    ref.current?.style.setProperty('--tilt-light-x', '50%')
    ref.current?.style.setProperty('--tilt-light-y', '50%')
    ref.current?.style.setProperty('--tilt-image-x', '0px')
    ref.current?.style.setProperty('--tilt-image-y', '0px')
    scale.set(1)
    tiltX.set(0)
    tiltY.set(0)
    onActiveChange?.(false)
  }

  return (
    <motion.figure
      ref={ref}
      className={`tilted-card ${className}`.trim()}
      onPointerMove={onPointerMove}
      onPointerEnter={(event) => {
        if (event.pointerType !== 'mouse') return
        bounds.current = event.currentTarget.getBoundingClientRect()
        activate()
      }}
      onPointerLeave={deactivate}
      onFocus={activate}
      onBlur={deactivate}
      tabIndex={focusable ? 0 : -1}
    >
      <motion.div className="tilted-card-inner" style={{ rotateX, rotateY, scale }}>
        <img src={imageSrc} alt={altText} className={`tilted-card-image ${imageClassName}`.trim()} loading={imageLoading} decoding="async" />
        {overlay}
      </motion.div>
    </motion.figure>
  )
}
