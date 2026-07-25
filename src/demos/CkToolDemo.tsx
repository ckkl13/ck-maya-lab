import { useRef, useState } from 'react'
import { Circle, Diamond, Hand, Palette, Play, RotateCcw, Square, Tag } from 'lucide-react'
import { gsap, useGSAP } from '../animation/gsap'
import { CheckRow, ControlGroup, TextRow } from '../components/FormControls'
import { MayaWindow } from '../components/MayaWindow'
import type { LogEntry, SceneNode } from '../types/tools'

const baseNodes: SceneNode[] = [
  { id: 'joint', name: 'jnt_l_hand_01', type: 'joint', depth: 0, selected: true },
  { id: 'mesh', name: 'hand_geo', type: 'group', depth: 0 },
]

const shapes = [
  { id: 'circle', label: '圆形', icon: Circle }, { id: 'square', label: '方形', icon: Square }, { id: 'diamond', label: '菱形', icon: Diamond }, { id: 'hand', label: '手型', icon: Hand },
]
const colors = ['#e94f4f', '#ff8c42', '#f2c94c', '#57cc99', '#46d7c5', '#4ea8de', '#9b5de5', '#f15bb5']

export default function CkToolDemo() {
  const scope = useRef<HTMLDivElement>(null)
  const [nodes, setNodes] = useState(baseNodes)
  const [logs, setLogs] = useState<LogEntry[]>([{ id: 1, tone: 'info', message: '已选择 jnt_l_hand_01' }])
  const [shape, setShape] = useState('circle')
  const [color, setColor] = useState('#46d7c5')
  const [size, setSize] = useState(1)
  const [name, setName] = useState('hand')
  const [tag, setTag] = useState('Hand')
  const [hasTag, setHasTag] = useState(false)
  const [fullHierarchy, setFullHierarchy] = useState(true)
  const [activePanel, setActivePanel] = useState<'appearance' | 'create' | 'tag'>('appearance')

  useGSAP(() => { gsap.from('.maya-window', { autoAlpha: 0, y: 16 }) }, { scope })

  const createController = () => {
    const cleanName = name.trim() || 'hand'
    const generated: SceneNode[] = fullHierarchy ? [
      { id: 'zero', name: `zero_l_${cleanName}_01`, type: 'group', depth: 0 },
      { id: 'driven', name: `driven_l_${cleanName}_01`, type: 'group', depth: 1 },
      { id: 'connect', name: `connect_l_${cleanName}_01`, type: 'group', depth: 2 },
      { id: 'offset', name: `offset_l_${cleanName}_01`, type: 'group', depth: 3 },
      { id: 'ctrl', name: `ctrl_l_${cleanName}_01`, type: 'controller', depth: 4, selected: true, color },
    ] : [
      { id: 'zero', name: `zero_l_${cleanName}_01`, type: 'group', depth: 0 },
      { id: 'offset', name: `grpOffset_l_${cleanName}_01`, type: 'group', depth: 1 },
      { id: 'ctrl', name: `ctrl_l_${cleanName}_01`, type: 'controller', depth: 2, selected: true, color },
    ]
    setNodes([...baseNodes.map((node) => ({ ...node, selected: false })), ...generated])
    setLogs((items) => [...items, { id: Date.now(), tone: 'success', message: `创建 ${shape} 控制器 · RGB ${color}` }])
    requestAnimationFrame(() => {
      const root = scope.current
      if (!root?.isConnected) return
      const controllers = root.querySelectorAll('.controller-shape')
      const outlinerRows = root.querySelectorAll('.outliner-row[data-node="zero"], .outliner-row[data-node="driven"], .outliner-row[data-node="connect"], .outliner-row[data-node="offset"], .outliner-row[data-node="ctrl"]')
      const timeline = gsap.timeline()
      if (controllers.length) timeline.from(controllers, { scale: 0, rotation: -45, transformOrigin: 'center' })
      if (outlinerRows.length) timeline.from(outlinerRows, { x: -14, autoAlpha: 0, stagger: 0.05 }, '<')
    })
  }

  const reset = () => {
    setNodes(baseNodes)
    setLogs([{ id: Date.now(), tone: 'info', message: 'CK Tool 演示已重置' }])
    setHasTag(false)
  }

  const updateControllerColor = (nextColor: string) => {
    setColor(nextColor)
    setNodes((current) => current.map((node) => node.type === 'controller' ? { ...node, color: nextColor } : node))
    const controllers = scope.current?.querySelectorAll('.controller-shape')
    if (controllers?.length) gsap.fromTo(controllers, { scale: 0.86 }, { scale: 1, duration: 0.32 })
  }

  const addTag = () => {
    if (!tag.trim()) return
    setHasTag(true)
    setLogs((items) => [...items, { id: Date.now(), tone: 'success', message: `已添加 Tag：${tag.trim()}` }])
  }

  return (
    <div ref={scope} className="demo-root">
      <MayaWindow title="综合工具 · CK Tool" accent="#ff725e" nodes={nodes} logs={logs} onReset={reset}>
        <div className="tool-heading"><span>CK TOOL</span><small>控制器与绑定工作流</small></div>
        <div className="mini-tabs" role="tablist">
          <button type="button" className={activePanel === 'appearance' ? 'is-active' : ''} onClick={() => setActivePanel('appearance')}>外观</button>
          <button type="button" className={activePanel === 'create' ? 'is-active' : ''} onClick={() => setActivePanel('create')}>创建</button>
          <button type="button" className={activePanel === 'tag' ? 'is-active' : ''} onClick={() => setActivePanel('tag')}>Tag</button>
        </div>
        {activePanel === 'appearance' ? <>
          <ControlGroup title="控制器形状">
            <div className="controller-library">{shapes.map(({ id, label, icon: Icon }) => <button type="button" key={id} title={label} className={shape === id ? 'is-active' : ''} onClick={() => setShape(id)}><Icon /></button>)}</div>
            <label className="slider-row"><span>曲线大小</span><input type="range" min="0.5" max="2" step="0.1" value={size} onChange={(event) => setSize(Number(event.target.value))} /><b>{size.toFixed(1)}</b></label>
            <div className="color-palette">{colors.map((item) => <button type="button" key={item} aria-label={`颜色 ${item}`} className={color === item ? 'is-active' : ''} style={{ background: item }} onClick={() => updateControllerColor(item)} />)}</div>
          </ControlGroup>
          <button type="button" className="primary-command full-command" onClick={createController}><Palette />应用形状与颜色</button>
        </> : null}
        {activePanel === 'create' ? <>
          <ControlGroup title="创建关节与控制器">
            <TextRow label="名称" value={name} onChange={setName} />
            <div className="control-row"><span>侧面</span><div className="side-switch"><button className="is-active">L</button><button>M</button><button>R</button></div></div>
            <CheckRow label="完整层级" checked={fullHierarchy} onChange={setFullHierarchy} />
            <CheckRow label="创建控制器" checked={true} onChange={() => undefined} />
          </ControlGroup>
          <button type="button" className="primary-command full-command" onClick={createController}><Play />创建关节与控制器</button>
        </> : null}
        {activePanel === 'tag' ? <>
          <ControlGroup title="创建 Tag 并选择">
            <TextRow label="Tag 名称" value={tag} onChange={setTag} />
            <div className="tag-preview"><Tag />{hasTag ? `${tag} · 已添加` : '尚未添加 Tag'}</div>
          </ControlGroup>
          <div className="command-row"><button type="button" className="secondary-command" onClick={() => setHasTag(false)}><RotateCcw />删除</button><button type="button" className="primary-command" onClick={addTag}><Tag />添加 Tag</button></div>
        </> : null}
      </MayaWindow>
    </div>
  )
}
