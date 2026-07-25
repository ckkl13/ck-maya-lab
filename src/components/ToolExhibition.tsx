import { useRef } from 'react'
import { ArrowDownToLine, ArrowUpRight } from 'lucide-react'
import { gsap, useGSAP } from '../animation/gsap'
import { tools } from '../data/tools'
import type { ToolId } from '../types/tools'

const artwork: Record<string, string> = {
  'rig-box': './media/exhibition/rig-box.png',
  'ck-tool': './media/exhibition/ck-tool.png',
  'scripts-box': './media/exhibition/scripts-box.png',
}

export function ToolExhibition() {
  const scope = useRef<HTMLElement>(null)

  const openInStudio = (id: ToolId, event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    window.history.replaceState(null, '', `#${id}`)
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    requestAnimationFrame(() => {
      document.getElementById('studio')?.scrollIntoView({ behavior: 'smooth' })
    })
  }

  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const intro = scope.current?.querySelector('.exhibition-intro')
      const works = gsap.utils.toArray<HTMLElement>('.exhibition-work')
      if (intro) {
        gsap.from(intro.querySelectorAll(':scope > *'), {
          autoAlpha: 0,
          y: 34,
          stagger: 0.1,
          duration: 0.72,
          ease: 'power3.out',
          scrollTrigger: { trigger: intro, start: 'top 78%', toggleActions: 'play none none reverse' },
        })
      }
      gsap.to('.exhibition-depth-orbit', {
        rotation: 16,
        scale: 1.08,
        ease: 'none',
        scrollTrigger: { trigger: scope.current, start: 'top bottom', end: 'bottom top', scrub: 0.9 },
      })
      gsap.to('.exhibition-current', {
        xPercent: 14,
        ease: 'none',
        scrollTrigger: { trigger: scope.current, start: 'top bottom', end: 'bottom top', scrub: 1.1 },
      })
      works.forEach((work) => {
        const imageLayer = work.querySelector('.work-visual img')
        if (imageLayer) {
          gsap.to(imageLayer, {
            yPercent: -7,
            scale: 1.045,
            ease: 'none',
            scrollTrigger: { trigger: work, start: 'top bottom', end: 'bottom top', scrub: 0.9 },
          })
        }
        const timeline = gsap.timeline({
          scrollTrigger: { trigger: work, start: 'top 76%', toggleActions: 'play none none reverse' },
        })
        timeline
          .from(work.querySelector('.work-number'), { autoAlpha: 0, x: -24, duration: 0.45 })
          .from(work.querySelector('.work-visual'), { y: 34, scale: 0.97, duration: 0.75, ease: 'power3.out' }, '<0.04')
          .from(work.querySelectorAll('.work-copy > *'), { autoAlpha: 0, y: 18, stagger: 0.07, duration: 0.46 }, '<0.16')
      })
    })
    return () => mm.revert()
  }, { scope })

  return (
    <section ref={scope} className="tool-exhibition" id="works" data-scene="works" data-scene-index="02">
      <div className="exhibition-depth" aria-hidden="true">
        <i className="exhibition-depth-orbit" />
        <i className="exhibition-current exhibition-current-a" />
        <i className="exhibition-current exhibition-current-b" />
      </div>
      <header className="exhibition-intro">
        <span>SELECTED WORKS / 2026</span>
        <h2>三件工具，三种 Maya 工作方式</h2>
        <p>这里先看作品，再进入可交互的真实界面。CK Tool、Scripts Box 的网页展示只还原真实 UI 状态，不执行 Maya、Python 或 MEL。</p>
      </header>
      <div className="exhibition-works">
        {tools.map((tool, index) => (
          <article id={`showcase-${tool.id}`} className={`exhibition-work tool-${tool.id} ${index % 2 ? 'is-reversed' : ''}`} key={tool.id}>
            <span className="work-number">0{index + 1}</span>
            <a className="work-visual" href={`#${tool.id}`} aria-label={`打开 ${tool.name} 交互演示`} onClick={(event) => openInStudio(tool.id, event)}>
              <img src={artwork[tool.id]} alt={`${tool.name} Maya 工具界面`} loading="lazy" />
              <span>VIEW INTERACTIVE UI <ArrowUpRight /></span>
            </a>
            <div className="work-copy">
              <p>{tool.category} · v{tool.version}</p>
              <h3>{tool.name}</h3>
              <strong>{tool.summary}</strong>
              <ul>{tool.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
              <div className="work-meta"><span>{tool.mayaVersions}</span><span>{tool.platforms}</span></div>
              <div className="work-actions">
                <a href={`#${tool.id}`} onClick={(event) => openInStudio(tool.id, event)}>查看效果<ArrowUpRight /></a>
                <a href={tool.downloadFile} download>下载 ZIP<ArrowDownToLine /></a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
