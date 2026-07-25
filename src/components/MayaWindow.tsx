import { ChevronDown, CircleDot, RotateCcw, Undo2, Redo2 } from 'lucide-react'
import type { LogEntry, SceneNode } from '../types/tools'

interface MayaWindowProps {
  title: string
  accent: string
  nodes: SceneNode[]
  logs: LogEntry[]
  children: React.ReactNode
  onReset: () => void
  onUndo?: () => void
  onRedo?: () => void
  viewport?: React.ReactNode
  onNodeSelect?: (id: string) => void
}

const nodeGlyph: Record<SceneNode['type'], string> = {
  joint: 'J',
  controller: 'C',
  group: 'G',
  locator: 'L',
  constraint: 'K',
}

export function MayaWindow({ title, accent, nodes, logs, children, onReset, onUndo, onRedo, viewport, onNodeSelect }: MayaWindowProps) {
  return (
    <div className="maya-window" style={{ '--tool-accent': accent } as React.CSSProperties}>
      <div className="maya-titlebar">
        <div className="maya-brand"><span>M</span></div>
        <strong>{title}</strong>
        <div className="maya-window-actions" aria-label="演示操作">
          <button type="button" onClick={onUndo} disabled={!onUndo} title="撤销"><Undo2 /></button>
          <button type="button" onClick={onRedo} disabled={!onRedo} title="重做"><Redo2 /></button>
          <button type="button" onClick={onReset} title="重置演示"><RotateCcw /></button>
        </div>
      </div>

      <div className="maya-menubar"><span>窗口</span><span>选择</span><span>显示</span><span>工具</span></div>

      <div className="maya-workspace">
        <aside className="maya-tool-panel">{children}</aside>
        <section className="maya-viewport" aria-label="虚拟 Maya 视口">
          <div className="viewport-toolbar"><span>透视</span><span>着色</span><span>灯光</span><CircleDot /></div>
          {viewport ?? <DefaultViewport nodes={nodes} />}
          <div className="viewport-axis"><b>Y</b><span>X</span><i>Z</i></div>
        </section>
        <aside className="maya-outliner" aria-label="虚拟 Outliner">
          <div className="panel-title">Outliner <ChevronDown /></div>
          <div className="outliner-list">
            {nodes.map((node) => onNodeSelect ? (
              <button type="button" key={node.id} className={`outliner-row ${node.selected ? 'is-selected' : ''} ${node.generated ? 'is-generated' : ''} ${node.hidden ? 'is-hidden' : ''}`} style={{ paddingLeft: 8 + node.depth * 14 }} data-node={node.id} aria-pressed={Boolean(node.selected)} onClick={() => onNodeSelect(node.id)}>
                <span className={`node-glyph type-${node.type}`}>{nodeGlyph[node.type]}</span>
                <span>{node.name}</span>
              </button>
            ) : (
              <div key={node.id} className={`outliner-row ${node.selected ? 'is-selected' : ''} ${node.generated ? 'is-generated' : ''} ${node.hidden ? 'is-hidden' : ''}`} style={{ paddingLeft: 8 + node.depth * 14 }} data-node={node.id}>
                <span className={`node-glyph type-${node.type}`}>{nodeGlyph[node.type]}</span>
                <span>{node.name}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <div className="maya-log" aria-live="polite">
        {logs.slice(-3).map((log) => <span key={log.id} className={`log-${log.tone}`}>{log.message}</span>)}
      </div>
    </div>
  )
}

function DefaultViewport({ nodes }: { nodes: SceneNode[] }) {
  const controllers = nodes.filter((node) => node.type === 'controller')
  return (
    <div className="scene-stage">
      <div className="grid-floor" />
      <svg className="rig-preview" viewBox="0 0 520 320" role="img" aria-label="关节与控制器预览">
        <path className="joint-chain" d="M250 270 L230 210 L265 150 L245 92 L270 42" />
        {[270, 210, 150, 92, 42].map((y, index) => <circle key={y} className="joint-dot" cx={index % 2 ? 230 + index * 7 : 250 + index * 5} cy={y} r="7" />)}
        {controllers.map((node, index) => (
          <g key={node.id} className="controller-shape" data-controller={node.id} transform={`translate(${250 + (index % 2 ? -14 : 10)} ${250 - index * 52})`}>
            <ellipse rx={35 + index * 2} ry="11" style={{ stroke: node.color || 'var(--tool-accent)' }} />
          </g>
        ))}
      </svg>
      <div className="scene-label">DEMO SCENE · FK_SPINE</div>
    </div>
  )
}
