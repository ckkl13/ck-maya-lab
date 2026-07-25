import { useRef } from 'react'
import { CheckCircle2, Download, MousePointer2, Play, Settings2 } from 'lucide-react'
import { gsap, useGSAP } from '../animation/gsap'

const steps = [
  { icon: MousePointer2, title: '选择样例对象', text: '在虚拟视口或 Outliner 中选择关节、控制器或脚本。' },
  { icon: Settings2, title: '调整真实参数', text: '控件名称、前置条件和组合关系来自工具当前源码。' },
  { icon: Play, title: '执行模拟命令', text: '网页用纯数据复现 Maya 节点、属性和管理状态的变化。' },
  { icon: CheckCircle2, title: '理解结果后下载', text: '对照操作结果、兼容版本和安装说明获取工具包。' },
]

export function WorkflowSection() {
  const scope = useRef<HTMLElement>(null)
  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const timeline = gsap.timeline({ scrollTrigger: { trigger: scope.current, start: 'top 72%', end: 'bottom 75%', scrub: 0.6 } })
      timeline.from('.workflow-intro > *', { autoAlpha: 0, y: 24, stagger: 0.12 }).from('.workflow-step', { autoAlpha: 0, x: 28, stagger: 0.18 }, '<0.15')
      return () => timeline.kill()
    })
    return () => mm.revert()
  }, { scope })

  return <section ref={scope} className="workflow-section" id="workflow"><div className="workflow-intro"><h2>从按钮到 Maya 结果</h2><p>每一步交互都沿着真实 UI 回调设计。网页不会执行 Maya 命令，但会把层级、选择、颜色、Tag 和脚本管理效果清楚地表现出来。</p><a href="#downloads"><Download />查看下载</a></div><ol className="workflow-list">{steps.map(({ icon: Icon, title, text }, index) => <li key={title} className="workflow-step"><span>0{index + 1}</span><Icon /><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol></section>
}
