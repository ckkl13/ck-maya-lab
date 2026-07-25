import { useRef, type ReactNode } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'
import './Dock.css'

export interface DockItemData {
  label: string
  href: string
  icon: ReactNode
}

interface DockProps {
  items: DockItemData[]
  baseItemSize?: number
  magnification?: number
  distance?: number
}

interface DockItemProps extends DockItemData {
  mouseX: ReturnType<typeof useMotionValue<number>>
  baseItemSize: number
  magnification: number
  distance: number
  reduceMotion: boolean
}

function DockItem({ label, href, icon, mouseX, baseItemSize, magnification, distance, reduceMotion }: DockItemProps) {
  const itemRef = useRef<HTMLAnchorElement>(null)
  const size = useTransform(mouseX, (pointerX) => {
    if (reduceMotion || !Number.isFinite(pointerX)) return baseItemSize
    const rect = itemRef.current?.getBoundingClientRect()
    if (!rect) return baseItemSize
    const delta = Math.abs(pointerX - (rect.left + rect.width / 2))
    const influence = Math.max(0, 1 - delta / distance)
    return baseItemSize + (magnification - baseItemSize) * influence * influence
  })
  const springSize = useSpring(size, { mass: 0.12, stiffness: 240, damping: 18 })

  return (
    <motion.a
      ref={itemRef}
      className="dock-item"
      href={href}
      style={{ width: springSize, height: springSize }}
      aria-label={label}
    >
      <span className="dock-icon" aria-hidden="true">{icon}</span>
      <span className="dock-label" role="tooltip">{label}</span>
    </motion.a>
  )
}

export function Dock({ items, baseItemSize = 38, magnification = 56, distance = 120 }: DockProps) {
  const mouseX = useMotionValue(Number.POSITIVE_INFINITY)
  const reduceMotion = useReducedMotion() ?? false

  return (
    <nav
      className="dock-panel"
      aria-label="页面导航"
      onPointerMove={(event) => {
        if (event.pointerType === 'mouse' && !reduceMotion) mouseX.set(event.clientX)
      }}
      onPointerLeave={() => mouseX.set(Number.POSITIVE_INFINITY)}
    >
      {items.map((item) => (
        <DockItem
          key={item.href}
          {...item}
          mouseX={mouseX}
          baseItemSize={baseItemSize}
          magnification={magnification}
          distance={distance}
          reduceMotion={reduceMotion}
        />
      ))}
    </nav>
  )
}
