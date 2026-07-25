import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Box, Code2, Download, ExternalLink, LoaderCircle, PanelLeft, Wrench } from 'lucide-react'
import { ScrollTrigger, gsap, useGSAP } from '../animation/gsap'
import { tools } from '../data/tools'
import type { ToolId } from '../types/tools'
import { SpotlightPanel } from './SpotlightPanel'

const RigBoxDemo = lazy(() => import('../demos/RigBoxDemo'))
const CkToolDemo = lazy(() => import('../demos/CkToolDemo'))
const ScriptsBoxDemo = lazy(() => import('../demos/ScriptsBoxDemo'))

const demos: Record<ToolId, React.LazyExoticComponent<React.ComponentType>> = {
  'rig-box': RigBoxDemo,
  'ck-tool': CkToolDemo,
  'scripts-box': ScriptsBoxDemo,
}

const toolIcons = { 'rig-box': Box, 'ck-tool': Wrench, 'scripts-box': Code2 }

function readToolFromHash(): ToolId {
  const hash = window.location.hash.replace('#', '') as ToolId
  return tools.some((tool) => tool.id === hash) ? hash : 'rig-box'
}

export function ToolStudio() {
  const scope = useRef<HTMLElement>(null)
  const [activeId, setActiveId] = useState<ToolId>(readToolFromHash)
  const activeTool = tools.find((tool) => tool.id === activeId) ?? tools[0]
  const Demo = demos[activeId]

  useEffect(() => {
    const onHashChange = () => setActiveId(readToolFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add({ desktop: '(min-width: 980px)', reduceMotion: '(prefers-reduced-motion: reduce)' }, (context) => {
      if (!context.conditions?.desktop || context.conditions.reduceMotion) return
      gsap.from('.studio-sidebar > *', { autoAlpha: 0, x: -18, stagger: 0.07, duration: 0.55 })
      gsap.from('.studio-stage', { autoAlpha: 0, y: 22, duration: 0.7 })
    })
    return () => mm.revert()
  }, { scope })

  const selectTool = (id: ToolId) => {
    if (id === activeId) return
    const stage = scope.current?.querySelector('.studio-stage')
    if (!stage) return
    gsap.to(stage, { autoAlpha: 0, y: 10, duration: 0.18, onComplete: () => {
      window.history.replaceState(null, '', `#${id}`)
      setActiveId(id)
      requestAnimationFrame(() => {
        gsap.fromTo(stage, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.42 })
        ScrollTrigger.refresh()
      })
    } })
  }

  return <section ref={scope} className="tool-studio" id="studio">
    <header className="studio-intro">
      <span>ROOM 03 / INTERACTIVE INSTALLATION</span>
      <h2>进入真实的 Maya 工具界面</h2>
      <p>所有控件名称和组合关系来自当前源码。切换工具、调整界面并理解工作流；只有 CK Rig Box 会在网页中模拟层级与约束结果。</p>
    </header>
    <aside className="studio-sidebar">
      <div className="sidebar-heading"><PanelLeft /><div><strong>工具工作台</strong><span>选择并直接体验</span></div></div>
      <nav className="tool-switcher" aria-label="Maya 工具">{tools.map((tool, index) => {
        const Icon = toolIcons[tool.id]
        return <button type="button" key={tool.id} className={tool.id === activeId ? 'is-active' : ''} aria-pressed={tool.id === activeId} onClick={() => selectTool(tool.id)} onPointerUp={(event) => event.currentTarget.blur()} style={{ '--item-accent': tool.accent } as React.CSSProperties}><span className="tool-index">0{index + 1}</span><Icon /><span><b>{tool.shortName}</b><small>{tool.category}</small></span></button>
      })}</nav>
      <SpotlightPanel className="active-tool-brief" color={`${activeTool.accent}20`}>{activeTool.screenshot ? <img src={activeTool.screenshot} alt={`${activeTool.name} 在 Maya 中的真实界面`} /> : null}<span>{activeTool.version}</span><h1>{activeTool.name}</h1><p>{activeTool.summary}</p><div className="compat-line"><span>{activeTool.mayaVersions}</span><span>Windows</span></div><a href="#downloads" className="sidebar-download"><Download />获取工具</a></SpotlightPanel>
    </aside>
    <div className="studio-stage" style={{ '--active-accent': activeTool.accent } as React.CSSProperties}>
      <div className="stage-bar"><span><i /> WEB INTERACTIVE DEMO</span><div><button type="button" onClick={() => document.getElementById('guide')?.scrollIntoView({ behavior: 'smooth' })}>使用说明 <ExternalLink /></button></div></div>
      <Suspense fallback={<div className="demo-loading"><LoaderCircle />正在载入工具界面</div>}><Demo /></Suspense>
    </div>
  </section>
}
