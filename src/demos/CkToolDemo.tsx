import { useRef, useState, type ReactNode } from 'react'
import { ChevronRight, Minus, RotateCcw, Square, X } from 'lucide-react'
import { gsap, useGSAP } from '../animation/gsap'

type SectionId = 'color' | 'create' | 'prefix' | 'tag' | 'jointTag'

const presetColors = [
  '#171717', '#6f6f6f', '#b9b9b9', '#ffffff', '#d81b45', '#8f002d', '#163ad8', '#0081ff',
  '#14b8a6', '#186a3b', '#48207a', '#dc27bd', '#7d2a21', '#51351f', '#d43a13', '#00d65c',
  '#1565c0', '#ffef35', '#00d9d1', '#00c6f2', '#ffb7bd', '#f2c7a5', '#fff2b5', '#2ecc71',
  '#996515', '#8f7f1d', '#709c1d', '#37a66b', '#2a9bb7', '#27749e', '#6332a8', '#a02a74',
]

interface AccordionProps {
  id: SectionId
  title: string
  open: boolean
  onToggle: (id: SectionId) => void
  children: ReactNode
}

function Accordion({ id, title, open, onToggle, children }: AccordionProps) {
  return (
    <section className={`ck-accordion ${open ? 'is-open' : ''}`}>
      <button type="button" className="ck-accordion-toggle" aria-expanded={open} onClick={() => onToggle(id)}>
        <ChevronRight />
        <strong>{title}</strong>
      </button>
      {open ? <div className="ck-accordion-content">{children}</div> : null}
    </section>
  )
}

export default function CkToolDemo() {
  const scope = useRef<HTMLDivElement>(null)
  const [openSections, setOpenSections] = useState<Set<SectionId>>(new Set())
  const [curveScale, setCurveScale] = useState(1)
  const [localScale, setLocalScale] = useState(false)
  const [lineWidth, setLineWidth] = useState(1)
  const [color, setColor] = useState('#00d9d1')
  const [createJoint, setCreateJoint] = useState(false)
  const [createController, setCreateController] = useState(true)
  const [recognizeName, setRecognizeName] = useState(false)
  const [ignoreSuffix, setIgnoreSuffix] = useState(true)
  const [useHierarchy, setUseHierarchy] = useState(true)
  const [prefix, setPrefix] = useState('')
  const [presetPrefix, setPresetPrefix] = useState('zero')
  const [tagName, setTagName] = useState('isCtrl')
  const [feedback, setFeedback] = useState('已载入 CK Tool 界面')

  useGSAP(() => {
    const windowElement = scope.current?.querySelector('.ck-combined-window')
    if (windowElement) gsap.from(windowElement, { autoAlpha: 0, y: 14, duration: 0.35, ease: 'power2.out' })
  }, { scope })

  const toggleSection = (id: SectionId) => {
    setOpenSections((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const previewAction = (label: string) => setFeedback(`${label}：网页仅更新界面状态`)

  const reset = () => {
    setOpenSections(new Set())
    setCurveScale(1)
    setLocalScale(false)
    setLineWidth(1)
    setColor('#00d9d1')
    setFeedback('CK Tool 界面已重置')
  }

  return (
    <div ref={scope} className="demo-root ck-tool-demo">
      <div className="ck-combined-window">
        <div className="native-titlebar">
          <span className="native-maya-icon">M<small>AYA</small></span>
          <strong>综合工具</strong>
          <div className="native-window-controls" aria-hidden="true"><Minus /><Square /><X /></div>
        </div>

        <div className="ck-window-body">
          <button type="button" className="ck-siri" title="重置界面" onClick={reset}>
            <img className="ck-siri-image" src="./media/ck-tool-siri.gif" alt="" />
          </button>
          <div className="ck-divider" />

          <div className="ck-fixed-controls">
            <div className="ck-control-line ck-scale-line">
              <label htmlFor="ck-curve-scale">曲线大小:</label>
              <input id="ck-curve-scale" type="number" min="0.1" max="10" step="0.1" value={curveScale} onChange={(event) => setCurveScale(Number(event.target.value))} />
              <button type="button" onClick={() => setCurveScale((value) => Math.min(10, Number((value + 0.1).toFixed(2))))}>变大</button>
              <button type="button" onClick={() => setCurveScale((value) => Math.max(0.1, Number((value - 0.1).toFixed(2))))}>变小</button>
            </div>
            <label className="ck-check"><input type="checkbox" checked={localScale} onChange={(event) => setLocalScale(event.target.checked)} />使用形状局部中心缩放</label>
            <div className="ck-control-line ck-width-line">
              <label htmlFor="ck-line-width">曲线粗细:</label>
              <input id="ck-line-width" type="number" min="1" max="10" value={lineWidth} onChange={(event) => setLineWidth(Number(event.target.value))} />
              <button type="button" onClick={() => previewAction(`应用粗细 ${lineWidth}`)}>应用粗细</button>
            </div>
            <div className="ck-reset-row">
              <button type="button" onClick={() => previewAction('位移归0')}>位移归0</button>
              <button type="button" onClick={() => previewAction('旋转归0')}>旋转归0</button>
              <button type="button" onClick={() => previewAction('缩放归1')}>缩放归1</button>
            </div>
          </div>

          <div className="ck-double-divider" />
          <div className="ck-accordion-scroll">
            <Accordion id="color" title="控制器颜色" open={openSections.has('color')} onToggle={toggleSection}>
              <div className="ck-form-row"><span>颜色:</span><button type="button" className="ck-color-preview" style={{ background: color }} onClick={() => previewAction(`当前颜色 ${color}`)}>{color}</button></div>
              <div className="ck-form-row ck-preset-row"><span>预设颜色:</span><div className="ck-color-grid">{presetColors.map((item) => <button type="button" key={item} aria-label={`颜色 ${item}`} className={color === item ? 'is-active' : ''} style={{ background: item }} onClick={() => setColor(item)} />)}</div></div>
              <button type="button" className="ck-wide-button" onClick={() => previewAction('应用颜色')}>应用颜色</button>
              <button type="button" className="ck-wide-button" onClick={() => setColor('#00d9d1')}><RotateCcw />重置颜色</button>
              <div className="ck-two-buttons"><button type="button" onClick={() => setColor(presetColors[Math.floor(Math.random() * presetColors.length)])}>随机颜色</button><button type="button" onClick={() => previewAction('渐变颜色')}>渐变颜色</button></div>
            </Accordion>

            <Accordion id="create" title="创建关节与控制器" open={openSections.has('create')} onToggle={toggleSection}>
              <div className="ck-inline-form"><label>自定义组名称:<input placeholder="输入组名" /></label><label className="ck-check"><input type="checkbox" />启用自定义组</label></div>
              <div className="ck-four-grid"><label>名称<input /></label><label>侧面<input placeholder="l,r,m" /></label><label>控制器大小<input type="number" defaultValue="1.0" /></label><label>数量<input type="number" defaultValue="1" /></label></div>
              <label className="ck-select-label">控制器类型:<select defaultValue="sphere"><option value="sphere">球形 (Sphere)</option><option>立方体 (Cube)</option><option>圆形 (Circle)</option><option>箭头 (Arrow)</option><option>齿轮 (Gear)</option><option>钻石 (Diamond)</option></select></label>
              <label className="ck-number-label">编号位数:<input type="number" defaultValue="2" min="1" /></label>
              <div className="ck-check-grid">
                <label className="ck-check"><input type="checkbox" checked={createJoint} onChange={(event) => setCreateJoint(event.target.checked)} />创建关节</label>
                <label className="ck-check"><input type="checkbox" checked={recognizeName} onChange={(event) => setRecognizeName(event.target.checked)} />识别物体名称</label>
                <label className="ck-check"><input type="checkbox" checked={createController} onChange={(event) => setCreateController(event.target.checked)} />创建控制器</label>
                <label className="ck-check"><input type="checkbox" checked={ignoreSuffix} onChange={(event) => setIgnoreSuffix(event.target.checked)} />忽略后缀</label>
                <label className="ck-check"><input type="checkbox" />创建子控制器</label>
                <label className="ck-check"><input type="checkbox" checked={useHierarchy} onChange={(event) => setUseHierarchy(event.target.checked)} />使用层级组逻辑</label>
              </div>
              <button type="button" className="ck-wide-button ck-primary" onClick={() => previewAction('创建关节与控制器')}>创建</button>
              <div className="ck-tool-button-grid"><button type="button" onClick={() => previewAction('镜像曲线形状')}>镜像曲线形状</button><button type="button" onClick={() => previewAction('替换曲线形状')}>替换曲线形状</button><button type="button" onClick={() => previewAction('添加形状节点')}>添加形状节点</button><button type="button" onClick={() => previewAction('曲线Shape重命名')}>曲线Shape重命名</button><button type="button" onClick={() => previewAction('切换显示在前面')}>切换显示在前面</button><button type="button" onClick={() => previewAction('次级控制器')}>次级控制器</button></div>
            </Accordion>

            <Accordion id="prefix" title="分组与前缀设置" open={openSections.has('prefix')} onToggle={toggleSection}>
              <label className="ck-form-row"><span>自定义前缀:</span><input value={prefix} onChange={(event) => setPrefix(event.target.value)} /></label>
              <label className="ck-form-row"><span>预设前缀:</span><select value={presetPrefix} onChange={(event) => setPresetPrefix(event.target.value)}><option>zero</option><option>driven</option><option>connect</option><option>offset</option><option>space</option></select></label>
              <div className="ck-check-grid"><label className="ck-check"><input type="checkbox" defaultChecked />去除前缀</label><label className="ck-check"><input type="checkbox" defaultChecked />使用现有后缀</label><label className="ck-check"><input type="checkbox" defaultChecked />冻结缩放</label><label className="ck-check"><input type="checkbox" defaultChecked />创建 Locator</label></div>
              <button type="button" className="ck-wide-button" onClick={() => previewAction('创建组')}>创建组</button>
              <div className="ck-two-buttons"><button type="button" onClick={() => previewAction('添加控制器层级')}>添加控制器层级</button><button type="button" onClick={() => previewAction('基础层级')}>基础层级</button></div>
            </Accordion>

            <Accordion id="tag" title="创建Tag并选择" open={openSections.has('tag')} onToggle={toggleSection}>
              <label className="ck-form-row"><span>Tag 名称:</span><input value={tagName} onChange={(event) => setTagName(event.target.value)} /></label>
              <div className="ck-two-buttons"><button type="button" onClick={() => previewAction(`添加 Tag ${tagName}`)}>添加Tag</button><button type="button" onClick={() => previewAction(`选择 Tag ${tagName}`)}>选择有tag的物体</button></div>
              <div className="ck-two-buttons"><button type="button" onClick={() => previewAction(`删除 Tag ${tagName}`)}>删除 Tag</button><button type="button" onClick={() => previewAction('识别选中物体的 Tag')}>识别选中物体的 Tag</button></div>
              <label className="ck-select-label">历史 Tag 记录:<select><option>无记录</option><option>isCtrl</option></select></label>
              <button type="button" className="ck-wide-button" onClick={() => previewAction('清空历史 Tag 记录')}>清空历史 Tag 记录</button>
            </Accordion>

            <Accordion id="jointTag" title="骨骼Tag" open={openSections.has('jointTag')} onToggle={toggleSection}>
              <button type="button" className="ck-wide-button" onClick={() => previewAction('骨骼绘制标签')}>骨骼绘制标签</button>
              <button type="button" className="ck-wide-button" onClick={() => previewAction('通用骨骼 Tag')}>通用骨骼Tag</button>
            </Accordion>
          </div>
          <div className="ck-feedback" aria-live="polite">{feedback}</div>
        </div>
      </div>
    </div>
  )
}
