import { useMemo, useRef, useState } from 'react'
import { Code2, FileCode2, GripVertical, Pin, Play, Plus, Search, Trash2, Undo2 } from 'lucide-react'
import { Flip, gsap, useGSAP } from '../animation/gsap'
import { MayaWindow } from '../components/MayaWindow'
import type { LogEntry, SceneNode } from '../types/tools'

interface DemoScript { id: string; name: string; type: 'PY' | 'MEL'; group: string; color: string; pinned?: boolean }

const initialScripts: DemoScript[] = [
  { id: 'reset', name: '重置变换', type: 'PY', group: '常用', color: '#46d7c5', pinned: true },
  { id: 'mirror', name: '镜像关节', type: 'PY', group: '绑定', color: '#ff725e' },
  { id: 'weight', name: '平滑权重', type: 'MEL', group: '绑定', color: '#f2c94c' },
  { id: 'curve', name: '曲线生成骨骼', type: 'PY', group: '绑定', color: '#72b7ff' },
  { id: 'bake', name: '烘焙动画', type: 'PY', group: '动画', color: '#c792ea' },
  { id: 'playblast', name: '快速拍屏', type: 'MEL', group: '动画', color: '#f78fb3' },
]
const groups = ['常用', '绑定', '动画']
const dummyNodes: SceneNode[] = [
  { id: 'scripts', name: 'scripts_box', type: 'group', depth: 0, selected: true },
  { id: 'tools', name: 'tools', type: 'group', depth: 1 },
  { id: 'config', name: 'config.json', type: 'group', depth: 1 },
]

export default function ScriptsBoxDemo() {
  const scope = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const [scripts, setScripts] = useState(initialScripts)
  const [group, setGroup] = useState('绑定')
  const [query, setQuery] = useState('')
  const [trash, setTrash] = useState<DemoScript[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([{ id: 1, tone: 'info', message: 'Scripts Box 演示数据已载入' }])
  const [collapsed, setCollapsed] = useState(false)

  useGSAP(() => { gsap.from('.maya-window', { autoAlpha: 0, y: 16 }) }, { scope })

  const visibleScripts = useMemo(() => scripts.filter((script) => {
    const matchesGroup = group === '常用' ? script.pinned || script.group === group : script.group === group
    return matchesGroup && script.name.toLowerCase().includes(query.trim().toLowerCase())
  }).sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned))), [scripts, group, query])

  const animateLayout = (update: () => void) => {
    const state = gridRef.current ? Flip.getState(gridRef.current.children) : null
    update()
    requestAnimationFrame(() => {
      if (state) Flip.from(state, { duration: 0.42, ease: 'power2.inOut', absolute: true, onEnter: (elements) => gsap.fromTo(elements, { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1 }) })
    })
  }

  const runScript = (script: DemoScript) => {
    const messages: Record<string, string> = { reset: '已重置 3 个虚拟对象', mirror: '已生成右侧虚拟关节链', weight: '已平滑 248 个虚拟顶点', curve: '已沿曲线创建 6 节骨骼', bake: '已烘焙 1-120 帧', playblast: '虚拟拍屏已完成' }
    setLogs((items) => [...items, { id: Date.now(), tone: 'success', message: `[模拟运行] ${messages[script.id]}` }])
    gsap.fromTo('.maya-log', { backgroundColor: 'rgba(70, 215, 197, 0.18)' }, { backgroundColor: 'rgba(17, 19, 22, 0.96)', duration: 0.8 })
  }

  const togglePin = (id: string) => animateLayout(() => setScripts((items) => items.map((script) => script.id === id ? { ...script, pinned: !script.pinned } : script)))
  const removeScript = (id: string) => animateLayout(() => setScripts((items) => {
    const removed = items.find((script) => script.id === id)
    if (removed) setTrash((current) => [...current, removed])
    return items.filter((script) => script.id !== id)
  }))
  const restoreLast = () => {
    const last = trash.at(-1)
    if (!last) return
    animateLayout(() => {
      setScripts((items) => [...items, last])
      setTrash((items) => items.slice(0, -1))
    })
  }
  const reset = () => { setScripts(initialScripts); setTrash([]); setQuery(''); setGroup('绑定'); setCollapsed(false) }

  return (
    <div ref={scope} className={`demo-root scripts-demo ${collapsed ? 'is-collapsed' : ''}`}>
      {collapsed ? <button type="button" className="scripts-orb" onClick={() => setCollapsed(false)} aria-label="展开 Scripts Box"><Code2 /><span>{scripts.length}</span></button> :
      <MayaWindow title="Maya 脚本管理器 · Scripts Box" accent="#f2c94c" nodes={dummyNodes} logs={logs} onReset={reset}>
        <div className="scripts-toolbar"><button type="button" title="新建演示脚本" onClick={() => animateLayout(() => setScripts((items) => [...items, { id: `new-${Date.now()}`, name: '新建脚本', type: 'PY', group, color: '#92a4b8' }]))}><Plus /></button><label><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索脚本" /></label><button type="button" title="折叠窗口" onClick={() => setCollapsed(true)}><Code2 /></button></div>
        <div className="scripts-layout">
          <nav className="script-groups" aria-label="脚本分组">{groups.map((item) => <button type="button" key={item} className={group === item ? 'is-active' : ''} onClick={() => setGroup(item)}><span>{item}</span><b>{scripts.filter((script) => item === '常用' ? script.pinned || script.group === item : script.group === item).length}</b></button>)}<button type="button" className="trash-button" onClick={restoreLast} disabled={!trash.length}><Trash2 /><span>回收站</span><b>{trash.length}</b></button></nav>
          <div ref={gridRef} className="script-grid">
            {visibleScripts.map((script) => <article key={script.id} className="script-card" style={{ '--script-color': script.color } as React.CSSProperties} draggable onDragEnd={() => togglePin(script.id)}>
              <div className="script-card-top"><GripVertical /><span>{script.type}</span><button type="button" className={script.pinned ? 'is-pinned' : ''} onClick={() => togglePin(script.id)} title="置顶"><Pin /></button></div>
              <FileCode2 /><strong>{script.name}</strong>
              <div className="script-actions"><button type="button" onClick={() => runScript(script)}><Play />模拟运行</button><button type="button" onClick={() => removeScript(script.id)} title="移到回收站"><Trash2 /></button></div>
            </article>)}
            {!visibleScripts.length ? <div className="empty-scripts">没有匹配的脚本</div> : null}
          </div>
        </div>
        <div className="simulation-note"><Undo2 /> 网页只模拟结果，不执行 Python 或 MEL</div>
      </MayaWindow>}
    </div>
  )
}
