import { useRef, useState } from 'react'
import { Crosshair, GitBranchPlus, Link2, Play } from 'lucide-react'
import { gsap, useGSAP } from '../animation/gsap'
import { CheckRow, ControlGroup, SelectRow, TextRow } from '../components/FormControls'
import { MayaWindow } from '../components/MayaWindow'
import type { LogEntry, SceneNode } from '../types/tools'

type RigMode = 'full' | 'simple' | 'group' | 'adv'
type RigShape = 'cube' | 'circle' | 'square'
type ConstraintKind = 'parent' | 'point' | 'orient' | 'scale'

interface RigController {
  nodeId: string
  jointIndex: number
  shape: RigShape
  sub: boolean
}

interface RigConstraint {
  id: string
  kind: ConstraintKind
  sourceId: string
  jointIndex: number
  duplicate: boolean
}

interface RigLocator {
  nodeId: string
  jointIndex: number
}

interface RigScene {
  nodes: SceneNode[]
  controllers: RigController[]
  constraints: RigConstraint[]
  locators: RigLocator[]
  revision: number
  status: string
}

interface ExecuteOptions {
  mode: RigMode
  shape: RigShape
  prefix: string
  constraints: ConstraintKind[]
  fkHierarchy: boolean
  createSub: boolean
  excludeLast: boolean
  fkDuplicate: boolean
  subParent: 'output' | 'ctrl'
}

const jointNodes: SceneNode[] = [
  { id: 'joint-0', name: 'jnt_spine_01', type: 'joint', depth: 0, selected: true },
  { id: 'joint-1', name: 'jnt_spine_02', type: 'joint', depth: 1 },
  { id: 'joint-2', name: 'jnt_spine_03', type: 'joint', depth: 2 },
  { id: 'joint-3', name: 'jnt_spine_end', type: 'joint', depth: 3 },
]

const initialScene: RigScene = {
  nodes: jointNodes,
  controllers: [],
  constraints: [],
  locators: [],
  revision: 0,
  status: '已选择 jnt_spine_01 关节链',
}

const modeLabels: Record<RigMode, string> = {
  full: 'zero层级',
  simple: 'zero简化',
  group: 'GP层级',
  adv: 'ADV层级',
}

const constraintLabels: Record<ConstraintKind, string> = {
  parent: 'Parent',
  point: 'Point',
  orient: 'Orient',
  scale: 'Scale',
}

const jointPositions = [
  { x: 250, y: 260 },
  { x: 224, y: 198 },
  { x: 264, y: 136 },
  { x: 242, y: 74 },
]

function stripTokens(name: string, rawTokens: string) {
  const tokens = rawTokens.replaceAll('，', ',').split(',').map((token) => token.trim()).filter(Boolean)
  const stripped = tokens.reduce((current, token) => current.replaceAll(token, ''), name)
  return stripped.replace(/_+/g, '_').replace(/^_+|_+$/g, '') || name
}

function hierarchyNames(mode: RigMode, base: string) {
  if (mode === 'simple') return [`zero_${base}`, `grpOffset_${base}`, `ctrl_${base}`]
  if (mode === 'group') return [`${base}_Gp`, `${base}_Gro`, `${base}_G`, `${base}_Ctrl`]
  if (mode === 'adv') return [`FKOffset_${base}`, `FKGlobal_${base}`, `FKExtra_${base}`, `FK_${base}`]
  return [`zero_${base}`, `driven_${base}`, `connect_${base}`, `offset_${base}`, `ctrl_${base}`]
}

function outputName(ctrlName: string) {
  if (ctrlName.startsWith('ctrl_')) return ctrlName.replace('ctrl_', 'output_')
  if (ctrlName.endsWith('_Ctrl')) return ctrlName.replace('_Ctrl', '_Output')
  return `output_${ctrlName}`
}

function selected(scene: RigScene, ids: string[]): RigScene {
  const selectedIds = new Set(ids)
  return { ...scene, nodes: scene.nodes.map((node) => ({ ...node, selected: selectedIds.has(node.id) })) }
}

function buildExecution(scene: RigScene, startJointIndex: number, options: ExecuteOptions): RigScene {
  const actionId = Date.now()
  const sourceJoints = jointNodes.slice(startJointIndex)
  const processedJoints = options.fkHierarchy
    ? sourceJoints.filter((_, index) => !(options.excludeLast && index === sourceJoints.length - 1))
    : sourceJoints.slice(0, 1)
  const constraintTargets = options.fkHierarchy ? sourceJoints : sourceJoints.slice(0, 1)
  const generated: SceneNode[] = []
  const controllers: RigController[] = []
  const controllerSources = new Map<number, string>()
  const duplicateIds = new Map<number, string>()

  if (options.fkDuplicate) {
    sourceJoints.forEach((joint, index) => {
      const jointIndex = startJointIndex + index
      const id = `fk-${actionId}-${jointIndex}`
      duplicateIds.set(jointIndex, id)
      generated.push({ id, name: `FK_${joint.name}`, type: 'joint', depth: index, generated: true, hidden: true })
    })
  }

  let chainDepth = 0
  processedJoints.forEach((joint, processedIndex) => {
    const jointIndex = startJointIndex + processedIndex
    const sourceName = options.fkDuplicate ? `FK_${joint.name}` : joint.name
    const base = stripTokens(sourceName, options.prefix)
    const names = hierarchyNames(options.mode, base)
    const controllerName = names.at(-1) as string
    const controllerId = `rig-${actionId}-${jointIndex}-ctrl`
    names.forEach((name, index) => generated.push({
      id: index === names.length - 1 ? controllerId : `rig-${actionId}-${jointIndex}-${index}`,
      name,
      type: index === names.length - 1 ? 'controller' : 'group',
      depth: chainDepth + index,
      color: index === names.length - 1 ? '#46d7c5' : undefined,
      generated: true,
    }))
    controllers.push({ nodeId: controllerId, jointIndex, shape: options.shape, sub: false })

    const ctrlDepth = chainDepth + names.length - 1
    if (options.createSub) {
      const subId = `sub-${actionId}-${jointIndex}`
      const outputId = `output-${actionId}-${jointIndex}`
      generated.push({ id: subId, name: `${controllerName}Sur`, type: 'controller', depth: ctrlDepth + 1, color: '#80b3ff', generated: true })
      generated.push({ id: outputId, name: outputName(controllerName), type: 'group', depth: ctrlDepth + 1, generated: true })
      controllers.push({ nodeId: subId, jointIndex, shape: options.shape, sub: true })
      controllerSources.set(jointIndex, outputId)
      chainDepth = ctrlDepth + (options.subParent === 'output' ? 2 : 1)
    } else {
      controllerSources.set(jointIndex, controllerId)
      chainDepth = ctrlDepth + 1
    }
  })

  const constraints: RigConstraint[] = []
  if (options.fkDuplicate) {
    constraintTargets.forEach((joint) => {
      const jointIndex = Number(joint.id.split('-')[1])
      options.constraints.forEach((kind) => constraints.push({
        id: `constraint-${actionId}-duplicate-${jointIndex}-${kind}`,
        kind,
        sourceId: duplicateIds.get(jointIndex) ?? '',
        jointIndex,
        duplicate: true,
      }))
    })
  }

  constraintTargets.forEach((joint) => {
    const jointIndex = Number(joint.id.split('-')[1])
    const fallbackIndex = Math.min(jointIndex, startJointIndex + processedJoints.length - 1)
    const sourceId = controllerSources.get(jointIndex) ?? controllerSources.get(fallbackIndex) ?? ''
    options.constraints.forEach((kind) => constraints.push({
      id: `constraint-${actionId}-control-${jointIndex}-${kind}`,
      kind,
      sourceId,
      jointIndex,
      duplicate: false,
    }))
  })

  if (constraints.length) {
    generated.push({ id: `rig-${actionId}-constraint-system`, name: 'ConstraintSystem', type: 'group', depth: 0, generated: true, hidden: true })
    constraints.forEach((constraint, index) => {
      const target = jointNodes[constraint.jointIndex]
      const prefix = constraint.duplicate ? 'FK_' : ''
      generated.push({
        id: constraint.id,
        name: `${prefix}${target.name}_${constraint.kind}Constraint${index + 1}`,
        type: 'constraint',
        depth: 1,
        generated: true,
        hidden: true,
      })
    })
  }

  const selectedControllers = controllers.filter((controller) => !controller.sub).map((controller) => controller.nodeId)
  const next = selected({
    nodes: [...jointNodes.map((node) => ({ ...node, selected: false })), ...generated],
    controllers,
    constraints,
    locators: [],
    revision: scene.revision + 1,
    status: `${modeLabels[options.mode]} · ${processedJoints.length} 个主控制器 · ${constraints.length} 个约束`,
  }, selectedControllers)
  return next
}

export default function RigBoxDemo() {
  const scope = useRef<HTMLDivElement>(null)
  const [scene, setScene] = useState(initialScene)
  const [past, setPast] = useState<RigScene[]>([])
  const [future, setFuture] = useState<RigScene[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([{ id: 1, tone: 'info', message: initialScene.status }])
  const [mode, setMode] = useState<RigMode>('full')
  const [shape, setShape] = useState<RigShape>('cube')
  const [prefix, setPrefix] = useState('jnt_')
  const [parentConstraint, setParentConstraint] = useState(true)
  const [pointConstraint, setPointConstraint] = useState(false)
  const [orientConstraint, setOrientConstraint] = useState(false)
  const [scaleConstraint, setScaleConstraint] = useState(true)
  const [fkHierarchy, setFkHierarchy] = useState(true)
  const [createSub, setCreateSub] = useState(false)
  const [excludeLast, setExcludeLast] = useState(false)
  const [rebuildPrevious, setRebuildPrevious] = useState(true)
  const [fkDuplicate, setFkDuplicate] = useState(false)
  const [subParent, setSubParent] = useState<'output' | 'ctrl'>('output')

  useGSAP(() => {
    gsap.from('.maya-window', { autoAlpha: 0, y: 16, duration: 0.42 })
  }, { scope })

  useGSAP(() => {
    if (!scene.revision) return
    const root = scope.current
    if (!root) return
    const generatedRows = root.querySelectorAll('.outliner-row.is-generated')
    const controllers = root.querySelectorAll('.rig-controller')
    const resultMarks = root.querySelectorAll('.rig-constraint-line, .rig-locator')
    if (!generatedRows.length && !controllers.length && !resultMarks.length) return
    const timeline = gsap.timeline({ defaults: { duration: 0.28, ease: 'power2.out' } })
    if (generatedRows.length) timeline.from(generatedRows, { x: -10, autoAlpha: 0, stagger: 0.018 })
    if (controllers.length) timeline.from(controllers, { scale: 0.45, autoAlpha: 0, transformOrigin: 'center', stagger: 0.05 }, generatedRows.length ? '<0.04' : 0)
    if (resultMarks.length) timeline.from(resultMarks, { autoAlpha: 0, stagger: 0.025 }, generatedRows.length || controllers.length ? '<0.08' : 0)
  }, { scope, dependencies: [scene.revision], revertOnUpdate: true })

  const commit = (next: RigScene, message: string) => {
    setPast((items) => [...items, scene])
    setFuture([])
    setScene(next)
    setLogs((items) => [...items, { id: Date.now(), tone: 'success', message }])
  }

  const warn = (message: string) => setLogs((items) => [...items, { id: Date.now(), tone: 'warning', message }])

  const execute = () => {
    const selectedJoint = scene.nodes.find((node) => node.selected && node.id.startsWith('joint-'))
    if (!selectedJoint) {
      warn('请先在 Outliner 或视口中选择源关节。')
      return
    }
    const constraints = ([
      parentConstraint && 'parent',
      pointConstraint && 'point',
      orientConstraint && 'orient',
      scaleConstraint && 'scale',
    ].filter(Boolean)) as ConstraintKind[]
    const startJointIndex = Number(selectedJoint.id.split('-')[1])
    const next = buildExecution(scene, startJointIndex, {
      mode,
      shape,
      prefix,
      constraints,
      fkHierarchy,
      createSub,
      excludeLast,
      fkDuplicate,
      subParent,
    })
    commit(next, `创建完成：${next.status}`)
  }

  const createLocator = () => {
    const targets = scene.nodes.filter((node) => node.selected)
    if (!targets.length) {
      warn('请先选择至少一个对象。')
      return
    }
    const actionId = Date.now()
    const locators = targets.map((target, index) => {
      const knownController = scene.controllers.find((controller) => controller.nodeId === target.id)
      const jointIndex = knownController?.jointIndex ?? (target.id.startsWith('joint-') ? Number(target.id.split('-')[1]) : 0)
      return { nodeId: `locator-${actionId}-${index}`, jointIndex }
    })
    const locatorNodes = targets.map((target, index): SceneNode => ({
      id: locators[index].nodeId,
      name: `${target.name}_loc`,
      type: 'locator',
      depth: target.depth + 1,
      selected: true,
      generated: true,
    }))
    const next = selected({
      ...scene,
      nodes: [...scene.nodes.map((node) => ({ ...node, selected: false })), ...locatorNodes],
      locators: [...scene.locators, ...locators],
      revision: scene.revision + 1,
      status: `已在 ${targets.length} 个对象下创建定位器`,
    }, locatorNodes.map((node) => node.id))
    commit(next, next.status)
  }

  const createSubOnly = () => {
    const targetControllers = scene.nodes.filter((node) => node.selected && node.type === 'controller' && !node.name.endsWith('Sur'))
    if (!targetControllers.length) {
      warn('当前选择中没有可创建次级的 NURBS 控制器。')
      return
    }
    const actionId = Date.now()
    const nodes: SceneNode[] = scene.nodes.map((node) => ({ ...node, selected: false }))
    const controllers = [...scene.controllers]
    const replacements = new Map<string, string>()
    targetControllers.forEach((target, index) => {
      if (scene.nodes.some((node) => node.name === `${target.name}Sur`)) return
      const source = scene.controllers.find((controller) => controller.nodeId === target.id)
      const subId = `sub-${actionId}-${index}`
      const outputId = `output-${actionId}-${index}`
      nodes.push({ id: subId, name: `${target.name}Sur`, type: 'controller', depth: target.depth + 1, color: '#80b3ff', generated: true })
      nodes.push({ id: outputId, name: outputName(target.name), type: 'group', depth: target.depth + 1, generated: true })
      controllers.push({ nodeId: subId, jointIndex: source?.jointIndex ?? 0, shape: source?.shape ?? shape, sub: true })
      replacements.set(target.id, outputId)
    })
    const constraints = rebuildPrevious
      ? scene.constraints.map((constraint) => ({ ...constraint, sourceId: replacements.get(constraint.sourceId) ?? constraint.sourceId }))
      : scene.constraints
    const next = selected({
      ...scene,
      nodes,
      controllers,
      constraints,
      revision: scene.revision + 1,
      status: `已为 ${replacements.size} 个控制器创建 Sur / output${rebuildPrevious ? '，并重建原约束' : ''}`,
    }, targetControllers.map((node) => node.id))
    if (!replacements.size) {
      warn('所选控制器已经包含次级控制器。')
      return
    }
    commit(next, next.status)
  }

  const reset = () => commit({ ...initialScene, nodes: jointNodes.map((node) => ({ ...node })), revision: scene.revision + 1 }, '演示场景已重置')

  const undo = past.length ? () => {
    const previous = past.at(-1) as RigScene
    setPast((items) => items.slice(0, -1))
    setFuture((items) => [scene, ...items])
    setScene({ ...previous, revision: scene.revision + 1 })
    setLogs((items) => [...items, { id: Date.now(), tone: 'info', message: '已撤销上一项 Maya 操作' }])
  } : undefined

  const redo = future.length ? () => {
    const next = future[0]
    setFuture((items) => items.slice(1))
    setPast((items) => [...items, scene])
    setScene({ ...next, revision: scene.revision + 1 })
    setLogs((items) => [...items, { id: Date.now(), tone: 'info', message: '已重做 Maya 操作' }])
  } : undefined

  const selectNode = (id: string) => {
    setScene((current) => selected(current, [id]))
    const node = scene.nodes.find((item) => item.id === id)
    if (node) setLogs((items) => [...items, { id: Date.now(), tone: 'info', message: `已选择 ${node.name}` }])
  }

  const generatedCount = scene.nodes.filter((node) => node.generated).length
  const selectedNames = scene.nodes.filter((node) => node.selected).map((node) => node.name)

  return (
    <div ref={scope} className="demo-root rig-box-demo">
      <MayaWindow
        title="FK工具 · CK Rig Box"
        accent="#46d7c5"
        nodes={scene.nodes}
        logs={logs}
        onReset={reset}
        onUndo={undo}
        onRedo={redo}
        onNodeSelect={selectNode}
        viewport={<RigBoxViewport scene={scene} onSelect={selectNode} />}
      >
        <div className="tool-heading"><span>FK SETUP</span><small>参数与 Maya 1.9 正式界面一致</small></div>
        <ControlGroup title="基础设置">
          <SelectRow label="层级模式" value={mode} onChange={(value) => setMode(value as RigMode)} options={[
            { value: 'full', label: 'zero层级' },
            { value: 'simple', label: 'zero简化' },
            { value: 'group', label: 'GP层级' },
            { value: 'adv', label: 'ADV层级' },
          ]} />
          <TextRow label="排除字符" value={prefix} onChange={setPrefix} placeholder="jnt_, bind_" />
          <SelectRow label="控制器形状" value={shape} onChange={(value) => setShape(value as RigShape)} options={[
            { value: 'cube', label: '正方体' },
            { value: 'circle', label: '圆形' },
            { value: 'square', label: '正方形' },
          ]} />
        </ControlGroup>
        <ControlGroup title="约束类型">
          <div className="check-grid rig-constraint-grid">
            <CheckRow label="Parent" checked={parentConstraint} onChange={setParentConstraint} />
            <CheckRow label="Point" checked={pointConstraint} onChange={setPointConstraint} />
            <CheckRow label="Orient" checked={orientConstraint} onChange={setOrientConstraint} />
            <CheckRow label="Scale" checked={scaleConstraint} onChange={setScaleConstraint} />
          </div>
        </ControlGroup>
        <ControlGroup title="选项">
          <div className="rig-option-grid">
            <CheckRow label="FK层级模式" checked={fkHierarchy} onChange={setFkHierarchy} />
            <CheckRow label="次级控制器" checked={createSub} onChange={setCreateSub} />
            <CheckRow label="排除末尾" checked={excludeLast} onChange={setExcludeLast} />
          </div>
          <SelectRow label="次级归属" value={subParent} disabled={!createSub} onChange={(value) => setSubParent(value as 'output' | 'ctrl')} options={[
            { value: 'output', label: '归属 Output' },
            { value: 'ctrl', label: '归属 Ctrl' },
          ]} />
          <CheckRow label="重建之前的约束" checked={rebuildPrevious} onChange={setRebuildPrevious} />
          <CheckRow label="FK复制模式" checked={fkDuplicate} onChange={setFkDuplicate} />
        </ControlGroup>
        <div className="rig-command-row">
          <button type="button" className="secondary-command" onClick={createLocator}><Crosshair />创建定位器</button>
          <button type="button" className="secondary-command" onClick={createSubOnly}><GitBranchPlus />创建次级</button>
          <button type="button" className="primary-command" onClick={execute}><Play />创建并约束</button>
        </div>
        <div className="rig-selection-status"><span>当前选择</span><b>{selectedNames.join(', ') || '无'}</b></div>
        <div className="tool-status"><Link2 /> {generatedCount} 个生成节点 · {scene.constraints.length} 个约束</div>
      </MayaWindow>
    </div>
  )
}

function RigBoxViewport({ scene, onSelect }: { scene: RigScene; onSelect: (id: string) => void }) {
  const selectedIds = new Set(scene.nodes.filter((node) => node.selected).map((node) => node.id))
  const hasDuplicate = scene.nodes.some((node) => node.id.startsWith('fk-'))
  const constraintKinds = [...new Set(scene.constraints.map((constraint) => constraint.kind))]
  return (
    <div className="scene-stage rig-box-viewport">
      <div className="grid-floor" />
      <svg className="rig-preview" viewBox="0 0 520 320" role="img" aria-label="CK Rig Box 关节、控制器与约束结果">
        <path className="joint-chain" d={`M${jointPositions.map((point) => `${point.x} ${point.y}`).join(' L')}`} />
        {hasDuplicate ? <path className="fk-duplicate-chain" d={`M${jointPositions.map((point) => `${point.x + 34} ${point.y}`).join(' L')}`} /> : null}
        {scene.constraints.map((constraint, index) => {
          const point = jointPositions[constraint.jointIndex]
          const sourceX = constraint.duplicate ? point.x + 34 : point.x + 30 + (index % 2) * 7
          return <line key={constraint.id} className={`rig-constraint-line kind-${constraint.kind}`} x1={sourceX} y1={point.y - 3} x2={point.x + 4} y2={point.y + 2} />
        })}
        {jointPositions.map((point, index) => (
          <g key={index} className={`rig-joint-target ${selectedIds.has(`joint-${index}`) ? 'is-selected' : ''}`} role="button" tabIndex={0} aria-label={`选择 ${jointNodes[index].name}`} onClick={() => onSelect(`joint-${index}`)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onSelect(`joint-${index}`) }}>
            <circle className="joint-dot" cx={point.x} cy={point.y} r="7" />
          </g>
        ))}
        {hasDuplicate ? jointPositions.map((point, index) => <circle key={`fk-${index}`} className="fk-joint-dot" cx={point.x + 34} cy={point.y} r="5" />) : null}
        {scene.controllers.map((controller) => {
          const point = jointPositions[controller.jointIndex]
          const selectedController = selectedIds.has(controller.nodeId)
          return (
            <g key={controller.nodeId} className={`rig-controller ${controller.sub ? 'is-sub' : ''} ${selectedController ? 'is-selected' : ''}`} data-controller={controller.nodeId} transform={`translate(${point.x} ${point.y}) scale(${controller.sub ? 0.78 : 1})`} role="button" tabIndex={0} aria-label="选择生成的控制器" onClick={() => onSelect(controller.nodeId)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onSelect(controller.nodeId) }}>
              <ControllerShape shape={controller.shape} />
            </g>
          )
        })}
        {scene.locators.map((locator) => {
          const point = jointPositions[locator.jointIndex]
          return <g key={locator.nodeId} className={`rig-locator ${selectedIds.has(locator.nodeId) ? 'is-selected' : ''}`} transform={`translate(${point.x + 14} ${point.y - 15})`} role="button" tabIndex={0} aria-label="选择定位器" onClick={() => onSelect(locator.nodeId)}><path d="M-9 0H9M0-9V9M-6-6L6 6M6-6L-6 6" /></g>
        })}
      </svg>
      <div className="rig-viewport-legend">
        <span><i className="legend-joint" />关节</span>
        <span><i className="legend-controller" />主控制器</span>
        {scene.controllers.some((controller) => controller.sub) ? <span><i className="legend-sub" />Sur</span> : null}
        {constraintKinds.length ? <span><i className="legend-constraint" />{constraintKinds.map((kind) => constraintLabels[kind]).join(' / ')}</span> : null}
      </div>
      <div className="scene-label">DEMO SCENE · FK_SPINE · 点击视口或 Outliner 选择</div>
    </div>
  )
}

function ControllerShape({ shape }: { shape: RigShape }) {
  if (shape === 'square') return <rect x="-32" y="-18" width="64" height="36" rx="1" />
  if (shape === 'circle') return <ellipse rx="35" ry="16" />
  return <g className="cube-controller"><path d="M-27-15L20-20L31 10L-18 17Z" /><path d="M-27-15L-17-27L31-21L20-20M31-21L31 10M-18 17L-17-27" /></g>
}
