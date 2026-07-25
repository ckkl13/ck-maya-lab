import { useRef, useState } from 'react'
import { Box, Circle, Crosshair, Link2, Play, Square } from 'lucide-react'
import { gsap, useGSAP } from '../animation/gsap'
import { CheckRow, ControlGroup, SelectRow, TextRow } from '../components/FormControls'
import { MayaWindow } from '../components/MayaWindow'
import type { LogEntry, SceneNode } from '../types/tools'

const initialNodes: SceneNode[] = [
  { id: 'root', name: 'jnt_spine_01', type: 'joint', depth: 0, selected: true },
  { id: 'spine2', name: 'jnt_spine_02', type: 'joint', depth: 1 },
  { id: 'spine3', name: 'jnt_spine_03', type: 'joint', depth: 2 },
  { id: 'end', name: 'jnt_spine_end', type: 'joint', depth: 3 },
]

type RigMode = 'full' | 'simple' | 'group' | 'advanced'

export default function RigBoxDemo() {
  const scope = useRef<HTMLDivElement>(null)
  const [nodes, setNodes] = useState(initialNodes)
  const [previous, setPrevious] = useState<SceneNode[] | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([{ id: 1, tone: 'info', message: '已选择 jnt_spine_01 关节链' }])
  const [mode, setMode] = useState<RigMode>('full')
  const [shape, setShape] = useState('cube')
  const [prefix, setPrefix] = useState('jnt_')
  const [parentConstraint, setParentConstraint] = useState(true)
  const [orientConstraint, setOrientConstraint] = useState(false)
  const [scaleConstraint, setScaleConstraint] = useState(false)
  const [fkHierarchy, setFkHierarchy] = useState(true)
  const [createSub, setCreateSub] = useState(false)
  const [excludeLast, setExcludeLast] = useState(true)
  const [fkDuplicate, setFkDuplicate] = useState(false)
  const [subParent, setSubParent] = useState('output')

  useGSAP(() => {
    gsap.from('.maya-window', { autoAlpha: 0, y: 16, duration: 0.5 })
  }, { scope })

  const execute = () => {
    const sourceJoints = initialNodes.filter((node) => !(excludeLast && node.id === 'end'))
    const generated: SceneNode[] = []
    const modeParts: Record<RigMode, string[]> = {
      full: ['zero', 'driven', 'connect', 'offset'],
      simple: ['zero', 'grpOffset'],
      group: ['Gp', 'Gro', 'G'],
      advanced: ['root', 'space', 'sdk', 'offset'],
    }
    sourceJoints.forEach((joint, jointIndex) => {
      const cleanName = joint.name.replace(prefix, '')
      if (fkDuplicate) generated.push({ id: `fk-${joint.id}`, name: `FK_${cleanName}`, type: 'joint', depth: jointIndex + 1 })
      modeParts[mode].forEach((part, index) => generated.push({ id: `${joint.id}-${part}`, name: `${part}_${cleanName}`, type: 'group', depth: fkHierarchy ? jointIndex + index : index }))
      generated.push({ id: `ctrl-${joint.id}`, name: `ctrl_${cleanName}`, type: 'controller', depth: fkHierarchy ? jointIndex + modeParts[mode].length : modeParts[mode].length, color: '#46d7c5' })
      if (createSub) generated.push({ id: `sub-${joint.id}`, name: `Sur_${cleanName}`, type: 'controller', depth: fkHierarchy ? jointIndex + modeParts[mode].length + 1 : modeParts[mode].length + 1, color: '#72b7ff' })
    })
    const constraintCount = [parentConstraint, orientConstraint, scaleConstraint].filter(Boolean).length * sourceJoints.length
    if (constraintCount) generated.push({ id: 'constraints', name: `ConstraintSystem (${constraintCount})`, type: 'constraint', depth: 0 })

    setPrevious(nodes)
    setNodes([...initialNodes, ...generated])
    setLogs((current) => [...current, { id: Date.now(), tone: 'success', message: `创建 ${sourceJoints.length} 个控制器 · ${constraintCount} 个约束` }])
    requestAnimationFrame(() => {
      const root = scope.current
      if (!root?.isConnected) return
      const outlinerRows = root.querySelectorAll('.outliner-row[data-node*="-"]')
      const controllers = root.querySelectorAll('.controller-shape')
      const latestLog = root.querySelectorAll('.maya-log span:last-child')
      const timeline = gsap.timeline({ defaults: { duration: 0.38, ease: 'power2.out' } })
      if (outlinerRows.length) timeline.from(outlinerRows, { x: -12, autoAlpha: 0, stagger: 0.035 })
      if (controllers.length) timeline.from(controllers, { scale: 0.2, autoAlpha: 0, transformOrigin: 'center', stagger: 0.08 }, '<0.08')
      if (latestLog.length) timeline.from(latestLog, { y: 8, autoAlpha: 0 }, '<0.15')
    })
  }

  const reset = () => {
    setPrevious(nodes)
    setNodes(initialNodes)
    setLogs([{ id: Date.now(), tone: 'info', message: '演示场景已重置' }])
  }

  const undo = previous ? () => {
    const current = nodes
    setNodes(previous)
    setPrevious(current)
    setLogs((items) => [...items, { id: Date.now(), tone: 'info', message: '已撤销上一操作' }])
  } : undefined

  return (
    <div ref={scope} className="demo-root">
      <MayaWindow title="FK工具 · CK Rig Box" accent="#46d7c5" nodes={nodes} logs={logs} onReset={reset} onUndo={undo}>
        <div className="tool-heading"><span>FK SETUP</span><small>选择关节后创建控制器层级</small></div>
        <ControlGroup title="基础设置">
          <SelectRow label="层级模式" value={mode} onChange={(value) => setMode(value as RigMode)} options={[
            { value: 'full', label: 'zero 层级' }, { value: 'simple', label: 'zero 简化' }, { value: 'group', label: 'GP 层级' }, { value: 'advanced', label: '高级层级' },
          ]} />
          <TextRow label="排除字符" value={prefix} onChange={setPrefix} />
          <div className="shape-picker" aria-label="控制器形状">
            {[
              { id: 'cube', icon: Box, label: '正方体' }, { id: 'circle', icon: Circle, label: '圆形' }, { id: 'square', icon: Square, label: '正方形' },
            ].map(({ id, icon: Icon, label }) => <button key={id} type="button" className={shape === id ? 'is-active' : ''} onClick={() => setShape(id)} title={label}><Icon /><span>{label}</span></button>)}
          </div>
        </ControlGroup>
        <ControlGroup title="约束类型">
          <div className="check-grid"><CheckRow label="Parent" checked={parentConstraint} onChange={setParentConstraint} /><CheckRow label="Orient" checked={orientConstraint} onChange={setOrientConstraint} /><CheckRow label="Scale" checked={scaleConstraint} onChange={setScaleConstraint} /></div>
        </ControlGroup>
        <ControlGroup title="选项">
          <CheckRow label="FK 层级模式" checked={fkHierarchy} onChange={setFkHierarchy} />
          <CheckRow label="次级控制器" checked={createSub} onChange={setCreateSub} />
          <CheckRow label="排除末尾" checked={excludeLast} onChange={setExcludeLast} />
          <CheckRow label="FK 复制模式" checked={fkDuplicate} onChange={setFkDuplicate} />
          <SelectRow label="次级归属" value={subParent} onChange={setSubParent} options={[{ value: 'output', label: '归属 Output' }, { value: 'ctrl', label: '归属 Ctrl' }]} />
        </ControlGroup>
        <div className="command-row"><button type="button" className="secondary-command" onClick={() => setLogs((items) => [...items, { id: Date.now(), tone: 'success', message: '已创建定位器 loc_spine_01' }])}><Crosshair />定位器</button><button type="button" className="primary-command" onClick={execute}><Play />创建并约束</button></div>
        <div className="tool-status"><Link2 /> {nodes.length - initialNodes.length} 个生成节点</div>
      </MayaWindow>
    </div>
  )
}
