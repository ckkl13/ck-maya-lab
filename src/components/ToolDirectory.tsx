import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, BookOpen, Boxes, Menu, MousePointer2, X } from 'lucide-react'
import { gsap, useGSAP } from '../animation/gsap'
import { toolCatalog } from '../data/toolCatalog'
import type { ToolId } from '../types/tools'
import { LineSidebar } from './LineSidebar'
import { StaggeredMenu } from './StaggeredMenu'
import './ToolDirectory.css'

interface ToolDirectoryProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ToolDirectory({ open, onOpenChange }: ToolDirectoryProps) {
  const content = useRef<HTMLDivElement>(null)
  const [activeGroupId, setActiveGroupId] = useState(toolCatalog[0].id)
  const activeGroup = useMemo(
    () => toolCatalog.find((group) => group.id === activeGroupId) ?? toolCatalog[0],
    [activeGroupId],
  )

  useEffect(() => {
    if (open) requestAnimationFrame(() => content.current?.querySelector<HTMLButtonElement>('button')?.focus())
  }, [open])

  useGSAP(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return
    gsap.fromTo('.tool-directory-card', { autoAlpha: 0, x: -16 }, {
      autoAlpha: 1,
      x: 0,
      stagger: 0.07,
      duration: 0.34,
      overwrite: true,
    })
  }, { dependencies: [activeGroupId], scope: content, revertOnUpdate: true })

  const close = useCallback(() => onOpenChange(false), [onOpenChange])

  const openStudio = (toolId: ToolId) => {
    window.history.replaceState(null, '', `#${toolId}`)
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    close()
    requestAnimationFrame(() => document.getElementById('studio')?.scrollIntoView({ behavior: 'smooth' }))
  }

  const openGuide = (toolId: ToolId) => {
    window.dispatchEvent(new CustomEvent('tool-guide-select', { detail: { toolId } }))
    close()
    requestAnimationFrame(() => document.getElementById('guide')?.scrollIntoView({ behavior: 'smooth' }))
  }

  return (
    <>
      <button
        type="button"
        className={`tool-directory-trigger ${open ? 'is-open' : ''}`}
        aria-label={open ? '关闭工具目录' : '打开工具目录'}
        aria-expanded={open}
        aria-controls="tool-directory-panel"
        onClick={() => onOpenChange(!open)}
      >
        {open ? <X /> : <Menu />}
        <span>目录</span>
      </button>

      <StaggeredMenu open={open} titleId="tool-directory-title" onClose={close}>
        <div id="tool-directory-panel" className="tool-directory-shell">
          <header className="tool-directory-heading">
            <span><Boxes /> TOOL INDEX</span>
            <h2 id="tool-directory-title">Maya 工具目录</h2>
            <p>按类别浏览工具，直接进入交互台或对应使用说明。</p>
          </header>

          <div className="tool-directory-layout">
            <LineSidebar groups={toolCatalog} activeId={activeGroupId} onSelect={setActiveGroupId} />
            <div ref={content} className="tool-directory-content" aria-live="polite">
              <div className="tool-directory-category">
                <span>{activeGroup.label}</span>
                <p>{activeGroup.description}</p>
              </div>
              {activeGroup.tools.map((tool, index) => (
                <article key={tool.id} className="tool-directory-card" style={{ '--catalog-accent': tool.accent } as React.CSSProperties}>
                  <span className="tool-directory-number">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <small>{tool.kind}</small>
                    <h3>{tool.name}</h3>
                  </div>
                  <div className="tool-directory-actions">
                    <button type="button" onClick={() => openStudio(tool.id)}><MousePointer2 />交互台<ArrowRight /></button>
                    <button type="button" onClick={() => openGuide(tool.id)}><BookOpen />使用说明<ArrowRight /></button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <footer className="tool-directory-footer">
            <span>{toolCatalog.reduce((total, group) => total + group.tools.length, 0)} TOOLS</span>
            <span>Maya 2022+ · Windows.Mac</span>
          </footer>
        </div>
      </StaggeredMenu>
    </>
  )
}
