import { useEffect, useRef, type PointerEvent } from 'react'
import type { ToolCatalogGroup } from '../data/toolCatalog'
import './LineSidebar.css'

interface LineSidebarProps {
  groups: ToolCatalogGroup[]
  activeId: string
  onSelect: (id: string) => void
}

export function LineSidebar({ groups, activeId, onSelect }: LineSidebarProps) {
  const root = useRef<HTMLDivElement>(null)
  const frame = useRef<number | null>(null)

  useEffect(() => () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current)
  }, [])

  const updateProximity = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const pointerY = event.clientY
    if (frame.current !== null) cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      root.current?.querySelectorAll<HTMLElement>('.line-sidebar-item').forEach((item) => {
        const rect = item.getBoundingClientRect()
        const distance = Math.abs(pointerY - (rect.top + rect.height / 2))
        const influence = Math.max(0, 1 - distance / 120)
        item.style.setProperty('--line-shift', `${Math.round(influence * 9)}px`)
        item.style.setProperty('--line-glow', influence.toFixed(2))
      })
    })
  }

  const resetProximity = () => {
    root.current?.querySelectorAll<HTMLElement>('.line-sidebar-item').forEach((item) => {
      item.style.removeProperty('--line-shift')
      item.style.removeProperty('--line-glow')
    })
  }

  return (
    <div ref={root} className="line-sidebar" onPointerMove={updateProximity} onPointerLeave={resetProximity}>
      {groups.map((group, index) => (
        <button
          key={group.id}
          type="button"
          className={`line-sidebar-item ${group.id === activeId ? 'is-active' : ''}`}
          aria-pressed={group.id === activeId}
          onClick={() => onSelect(group.id)}
        >
          <span className="line-sidebar-index">0{index + 1}</span>
          <span><strong>{group.label}</strong><small>{group.tools.length} TOOLS</small></span>
        </button>
      ))}
    </div>
  )
}
