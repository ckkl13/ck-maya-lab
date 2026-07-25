import { useMemo, useRef, useState, type FormEvent, type MouseEvent, type ReactNode } from 'react'
import { CircleHelp, FileCode2, FolderPlus, Minus, Plus, RefreshCw, Search, Settings, Square, Trash2, X } from 'lucide-react'
import { gsap, useGSAP } from '../animation/gsap'

interface ScriptGroup { id: string; name: string; count: number }
interface DemoScript { id: string; name: string; group: string; type: 'PY' | 'MEL'; pinned?: boolean }
type ModalKind = 'new' | 'settings' | 'help' | 'group' | null

const sourceGroups: ScriptGroup[] = [
  { id: 'weight', name: '权重', count: 16 }, { id: 'joint', name: '骨骼', count: 11 }, { id: 'rig', name: '绑定小工具', count: 21 },
  { id: 'bs', name: 'BS', count: 15 }, { id: 'common', name: '常用', count: 20 }, { id: 'cktool', name: 'cktool', count: 8 },
  { id: 'ng', name: 'ng', count: 7 }, { id: 'dynamic', name: '动力学骨', count: 8 }, { id: 'animation', name: '动画小工具', count: 12 },
  { id: 'curve', name: '曲线工具', count: 12 }, { id: 'face', name: '脸部绑定和毛囊', count: 11 }, { id: 'body', name: '身体脚本', count: 11 },
  { id: 'model', name: '模型', count: 24 }, { id: 'io', name: '导入导出', count: 7 }, { id: 'misc', name: '杂项', count: 15 },
  { id: 'convert', name: '转换', count: 1 }, { id: 'project', name: '项目脚本', count: 15 },
]

const samples: Record<string, string[]> = {
  common: ['A选择层级.py', '排列工具.py', 'wp_rename.mel', '匹配.py', '选择相连面.py', '对齐栅格.py', 'A位移0.mel', 'A旋转0.mel', 'A缩放1.mel', 'loc.py', '创建zero组.py', '创建旋转片.mel', '创建组层级.py', '属性移动工具.mel', '打印选择.py', '绑定工具箱.mel', '重加载并重命名.py', '重加载文件.py', '重命名选中物体的shape.py', '重启maya并重启文件.py'],
  weight: ['权重传递.py', '批量权重传递.py', '平滑权重.py', '检查顶点权重.py', '检测超出骨骼影响数权重点.mel', '选择模型上已蒙皮的骨骼.py'],
  joint: ['轴向保持骨骼镜像.py', '批量骨骼镜像.py', '设置骨骼半径.py', '选择生成骨骼.py', '骨骼绘制.mel', '修复关节方向数值.py'],
  rig: ['选中生成控制器并绑定.py', '创建基础层级组.py', '添加空间切换属性.py', '对齐工具.py', '自动绑定小物件.mel', '简易RBF.py'],
  bs: ['BlendShape拆分V2.py', '提取模型BS通用版升级版.py', '混合变形模型镜像.mel', '点序传递.py', 'bs合并.py'],
  cktool: ['transform_reset_tool.py', 'tag_tool.py', 'joint_TagV2.py', 'curve_scale_tool.py', 'color_tool.py'],
  ng: ['NG导出蒙皮.py', 'NG导入蒙皮.py', 'ng设置修剪小权重.py', 'skinCluster最大影响设置.py'],
  dynamic: ['一键动力学.py', '动力学.py', '动力学连接.py', '碰撞体.py', 'springmagic.py'],
  animation: ['一键烘焙动画场景v2.0.py', '临时轴心点.py', '拍屏.py', '映射动画.py', '镜像角色动画曲线工具.mel'],
  curve: ['曲线工具整合.py', '曲线提取（独立版）.py', '曲线生成骨骼和loc.mel', '骨骼生成曲线.py', 'curve_rotate_tool.py'],
  face: ['连接面部控制器与骨骼.py', '选择创建毛囊.mel', '表情控制框工具.mel', '眼皮骨骼创建.py', 'zip拉链嘴.py'],
  body: ['姿势工具.py', '手指pose.py', '手指属性.py', '肌肉运行.py', '镜像修型骨参数.py'],
  model: ['模型镜像.mel', '曲线管道.py', '布尔工具集.py', '随机抖动模型.py', '摄像机切换器精简版.py', '填充面.py'],
  io: ['批量导入导出OBJ.mel', '导入导出驱动关键帧.py', '资产检查.py', '检查.py', '导出和导入权重，高版本到低版本.py'],
  misc: ['随机生成骨骼.py', '批量属性.mel', '编译py和反编译.py', '软选择控制器.py', '提示命令参考.py'],
  convert: ['mel转py.py'],
  project: ['清理文件残留.py', '删除所有脚本节点.py', '断开所有反向缩放.py', '父子缩放约束.py', 'MH项目导出游戏的.py'],
}

const scripts: DemoScript[] = sourceGroups.flatMap((group) => (samples[group.id] ?? []).map((name, index) => ({
  id: `${group.id}-${index}`,
  name,
  group: group.id,
  type: name.toLowerCase().endsWith('.mel') ? 'MEL' : 'PY',
  pinned: group.id === 'common' && index < 2,
})))

interface DemoModalProps { title: string; onClose: () => void; children: ReactNode }
function DemoModal({ title, onClose, children }: DemoModalProps) {
  return (
    <div className="sb-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="sb-modal" role="dialog" aria-modal="true" aria-label={title}>
        <header><strong>{title}</strong><button type="button" aria-label="关闭" onClick={onClose}><X /></button></header>
        {children}
      </section>
    </div>
  )
}

export default function ScriptsBoxDemo() {
  const scope = useRef<HTMLDivElement>(null)
  const [activeGroup, setActiveGroup] = useState('common')
  const [query, setQuery] = useState('')
  const [selectedScript, setSelectedScript] = useState<string | null>(null)
  const [modal, setModal] = useState<ModalKind>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [columns, setColumns] = useState<1 | 2>(2)
  const [feedback, setFeedback] = useState('常用分组已载入')
  const [customGroups, setCustomGroups] = useState<ScriptGroup[]>([])
  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null)
  const [draftType, setDraftType] = useState<'PY' | 'MEL'>('PY')

  const groups = useMemo(() => [...sourceGroups, ...customGroups], [customGroups])
  const searchText = query.trim().toLowerCase()
  const visibleScripts = useMemo(() => {
    const source = searchText ? scripts : scripts.filter((script) => script.group === activeGroup)
    return source.filter((script) => script.name.toLowerCase().includes(searchText)).sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)))
  }, [activeGroup, searchText])

  const activeName = searchText ? '搜索结果' : groups.find((group) => group.id === activeGroup)?.name ?? '脚本'

  useGSAP(() => {
    const windowElement = scope.current?.querySelector('.sb-window')
    if (windowElement) gsap.from(windowElement, { autoAlpha: 0, y: 14, duration: 0.35, ease: 'power2.out' })
  }, { scope })

  useGSAP(() => {
    const buttons = scope.current?.querySelectorAll('.sb-script-button')
    if (buttons?.length) gsap.from(buttons, { autoAlpha: 0, y: 6, duration: 0.2, stagger: 0.015, ease: 'power2.out' })
  }, { scope, dependencies: [activeGroup, searchText, columns], revertOnUpdate: true })

  const chooseGroup = (id: string, name: string) => {
    setQuery('')
    setActiveGroup(id)
    setSelectedScript(null)
    setFeedback(`${name}分组已载入`)
  }

  const chooseScript = (script: DemoScript) => {
    setSelectedScript(script.id)
    setContextMenu(null)
    setFeedback(`已选择 ${script.name.replace(/\.(py|mel)$/i, '')}，未执行脚本`)
  }

  const showContextMenu = (event: MouseEvent, id: string) => {
    event.preventDefault()
    const host = scope.current?.getBoundingClientRect()
    setContextMenu({ id, x: event.clientX - (host?.left ?? 0), y: event.clientY - (host?.top ?? 0) })
  }

  const submitGroup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const name = String(data.get('groupName') ?? '').trim()
    if (!name) return
    const id = `custom-${Date.now()}`
    setCustomGroups((current) => [...current, { id, name, count: 0 }])
    setActiveGroup(id)
    setModal(null)
    setFeedback(`已创建界面分组 ${name}`)
  }

  if (collapsed) {
    return <div ref={scope} className="demo-root scripts-box-demo is-collapsed"><button type="button" className="sb-collapse-icon" aria-label="展开 Scripts Box" onClick={() => setCollapsed(false)}><FileCode2 /><span>{sourceGroups.length}</span></button></div>
  }

  return (
    <div ref={scope} className="demo-root scripts-box-demo" onClick={() => setContextMenu(null)}>
      <div className="sb-window">
        <div className="native-titlebar">
          <span className="native-maya-icon">M<small>AYA</small></span>
          <strong>Maya 脚本管理器</strong>
          <div className="native-window-controls"><button type="button" aria-label="折叠窗口" onClick={() => setCollapsed(true)}><Minus /></button><span aria-hidden="true"><Square /></span><span aria-hidden="true"><X /></span></div>
        </div>

        <div className="sb-shell">
          <aside className="sb-sidebar">
            <div className="sb-sidebar-title"><span className="sb-stack-icon" /><strong>脚本分组</strong></div>
            <button type="button" className="sb-add-group" title="新建分组" onClick={() => setModal('group')}><FolderPlus /></button>
            <div className="sb-side-rule" />
            <button type="button" className={`sb-trash ${activeGroup === 'trash' ? 'is-active' : ''}`} title="回收站" onClick={() => chooseGroup('trash', '回收站')}><Trash2 /></button>
            <nav className="sb-group-list" aria-label="脚本分组">
              {groups.map((group) => <button type="button" key={group.id} className={activeGroup === group.id && !searchText ? 'is-active' : ''} onClick={() => chooseGroup(group.id, group.name)}><span>{group.name}</span><b>({group.count})</b></button>)}
            </nav>
          </aside>

          <main className="sb-content">
            <div className="sb-toolbar">
              <button type="button" title="新建脚本" onClick={() => setModal('new')}><Plus /></button>
              <button type="button" title="刷新" onClick={(event) => { gsap.fromTo(event.currentTarget, { rotation: 0 }, { rotation: 360, duration: 0.45 }); setFeedback('脚本列表界面已刷新') }}><RefreshCw /></button>
              <button type="button" title="设置" onClick={() => setModal('settings')}><Settings /></button>
              <label htmlFor="sb-search">搜索:</label>
              <div className="sb-search-box"><input id="sb-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="输入脚本名称搜索..." /><button type="button" aria-label="搜索"><Search /></button><button type="button" aria-label="清除搜索" onClick={() => setQuery('')}><X /></button></div>
              <button type="button" className="sb-help" title="帮助" onClick={() => setModal('help')}><CircleHelp /></button>
            </div>

            <h2>{activeGroup === 'trash' ? '回收站' : activeName}</h2>
            <div className="sb-content-rule" />
            {activeGroup === 'trash' ? <div className="sb-empty"><Trash2 /><strong>回收站为空</strong><span>删除的脚本和分组会显示在这里</span></div> :
              <div className={`sb-script-grid columns-${columns}`}>
                {visibleScripts.map((script) => <button type="button" key={script.id} className={`sb-script-button ${selectedScript === script.id ? 'is-selected' : ''}`} onClick={() => chooseScript(script)} onContextMenu={(event) => showContextMenu(event, script.id)}>
                  <span className={`sb-file-icon type-${script.type.toLowerCase()}`}>{script.type === 'PY' ? 'Py' : 'M'}</span>
                  <span>{script.name.replace(/\.(py|mel)$/i, '')}</span>
                  {script.pinned ? <i>置顶</i> : null}
                </button>)}
                {!visibleScripts.length ? <div className="sb-empty"><Search /><strong>没有匹配的脚本</strong><span>调整搜索词或切换分组</span></div> : null}
              </div>}
            <div className="sb-status" aria-live="polite">{feedback}</div>
          </main>
        </div>
      </div>

      {contextMenu ? <div className="sb-context-menu" style={{ left: contextMenu.x, top: contextMenu.y }} onClick={(event) => event.stopPropagation()}>
        {['编辑脚本', '置顶', '编辑提示信息', '设置按钮颜色', '移动到分组', '移到回收站'].map((label) => <button type="button" key={label} onClick={() => { setFeedback(`${label}：仅展示菜单状态`); setContextMenu(null) }}>{label}</button>)}
      </div> : null}

      {modal === 'group' ? <DemoModal title="新建分组" onClose={() => setModal(null)}><form className="sb-modal-form" onSubmit={submitGroup}><label>分组名称<input name="groupName" autoFocus /></label><div className="sb-modal-actions"><button type="button" onClick={() => setModal(null)}>取消</button><button type="submit" className="is-primary">创建</button></div></form></DemoModal> : null}

      {modal === 'new' ? <DemoModal title="脚本编辑器" onClose={() => setModal(null)}><div className="sb-modal-form"><label>脚本名称<input defaultValue="新建脚本" /></label><div className="sb-type-switch"><button type="button" className={draftType === 'PY' ? 'is-active' : ''} onClick={() => setDraftType('PY')}>Python</button><button type="button" className={draftType === 'MEL' ? 'is-active' : ''} onClick={() => setDraftType('MEL')}>MEL</button></div><textarea aria-label="脚本内容" defaultValue={draftType === 'PY' ? '# Python\n' : '// MEL\n'} /><div className="sb-modal-actions"><button type="button" onClick={() => setModal(null)}>取消</button><button type="button" className="is-primary" onClick={() => { setModal(null); setFeedback('脚本编辑草稿已关闭，未写入文件') }}>保存</button></div></div></DemoModal> : null}

      {modal === 'settings' ? <DemoModal title="设置" onClose={() => setModal(null)}><div className="sb-modal-form"><fieldset><legend>按钮布局</legend><label><input type="radio" checked={columns === 1} onChange={() => setColumns(1)} />单列</label><label><input type="radio" checked={columns === 2} onChange={() => setColumns(2)} />双列</label></fieldset><label className="sb-setting-check"><input type="checkbox" defaultChecked />记住最后使用的分组</label><label className="sb-setting-check"><input type="checkbox" defaultChecked />启用折叠图标动画</label><div className="sb-settings-buttons"><button type="button" onClick={() => setFeedback('打开脚本目录：网页未访问本地文件')}>打开脚本目录</button><button type="button" onClick={() => setFeedback('导入配置：网页未读取文件')}>导入配置</button><button type="button" onClick={() => setFeedback('导出配置：网页未写入文件')}>导出配置</button></div><div className="sb-modal-actions"><button type="button" className="is-primary" onClick={() => setModal(null)}>确定</button></div></div></DemoModal> : null}

      {modal === 'help' ? <DemoModal title="Scripts Box 帮助" onClose={() => setModal(null)}><div className="sb-help-content"><p>左侧用于切换和管理脚本分组，顶部工具栏用于新建、刷新、设置与搜索。</p><p>单击脚本按钮可选中条目；右键可查看编辑、置顶、颜色、移动和回收站菜单。</p><p>此网页版本只展示界面交互，不读取、写入或执行任何 Python / MEL 文件。</p><button type="button" onClick={() => setModal(null)}>关闭</button></div></DemoModal> : null}
    </div>
  )
}
