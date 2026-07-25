import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, BookOpen, Boxes, GalleryVerticalEnd, Menu, MousePointer2, X } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
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
  const reduceMotion = useReducedMotion() ?? false
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

  const openShowcase = (toolId: ToolId) => {
    window.history.replaceState(null, '', `#showcase-${toolId}`)
    close()
    requestAnimationFrame(() => document.getElementById(`showcase-${toolId}`)?.scrollIntoView({ behavior: 'smooth' }))
  }

  const openGuide = (toolId: ToolId) => {
    window.dispatchEvent(new CustomEvent('tool-guide-select', { detail: { toolId } }))
    close()
    requestAnimationFrame(() => document.getElementById('guide')?.scrollIntoView({ behavior: 'smooth' }))
  }

  return (
    <>
      <motion.button
        type="button"
        className={`tool-directory-trigger ${open ? 'is-open' : ''}`}
        aria-label={open ? '关闭工具目录' : '打开工具目录'}
        aria-expanded={open}
        aria-controls="tool-directory-panel"
        onClick={() => onOpenChange(!open)}
        whileHover={reduceMotion ? undefined : { scale: 1.24, y: -4 }}
        whileTap={reduceMotion ? undefined : { scale: 0.94 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18, mass: 0.14 }}
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            key={open ? 'close' : 'menu'}
            className="tool-directory-trigger-icon"
            initial={reduceMotion ? false : { opacity: 0, rotate: -55, scale: 0.55 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, rotate: 55, scale: 0.55 }}
            transition={{ duration: reduceMotion ? 0 : 0.16, ease: 'easeOut' }}
          >
            {open ? <X /> : <Menu />}
          </motion.span>
        </AnimatePresence>
        <span className="tool-directory-trigger-label" role="tooltip">{open ? '关闭目录' : '工具目录'}</span>
      </motion.button>

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
                    <button type="button" onClick={() => openShowcase(tool.id)}><GalleryVerticalEnd />工具展示<ArrowRight /></button>
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
