import { useRef, type PointerEvent, type ReactNode } from 'react'
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
  const reduceMotion = useReducedMotion() ?? false
  const tiltX = useMotionValue(0)
  const tiltY = useMotionValue(0)
  const rotateX = useSpring(tiltY, spring)
  const rotateY = useSpring(tiltX, spring)
  const scale = useSpring(1, spring)

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (reduceMotion || event.pointerType !== 'mouse' || !ref.current) return
    const bounds = ref.current.getBoundingClientRect()
    const offsetX = event.clientX - bounds.left - bounds.width / 2
    const offsetY = event.clientY - bounds.top - bounds.height / 2
    tiltY.set((offsetY / (bounds.height / 2)) * -rotateAmplitude)
    tiltX.set((offsetX / (bounds.width / 2)) * rotateAmplitude)
    activate()
  }

  const activate = () => {
    if (active.current) return
    active.current = true
    if (!reduceMotion) scale.set(scaleOnHover)
    onActiveChange?.(true)
  }

  const deactivate = () => {
    if (!active.current) return
    active.current = false
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
      onPointerEnter={(event) => event.pointerType === 'mouse' && activate()}
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
