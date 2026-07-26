import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { ArrowRight, BookOpen, CheckCircle2, Download, FileCode2 } from 'lucide-react'
import { ScrollTrigger, gsap, useGSAP } from '../animation/gsap'
import { toolGuides } from '../data/toolGuides'
import { ScrollFloatText } from './ScrollFloatText'
import { VariableProximity } from './VariableProximity'

export function ToolUsageGuides() {
  const scope = useRef<HTMLElement>(null)
  const progress = useRef<HTMLSpanElement>(null)
  const [activeTool, setActiveTool] = useState(0)
  const [activeChapter, setActiveChapter] = useState(0)
  const guide = toolGuides[activeTool]
  const chapter = guide.chapters[activeChapter]

  useEffect(() => {
    const selectFromDirectory = (event: Event) => {
      const { toolId } = (event as CustomEvent<{ toolId: string }>).detail
      const index = toolGuides.findIndex((item) => item.id === toolId)
      if (index >= 0) selectTool(index)
    }
    window.addEventListener('tool-guide-select', selectFromDirectory)
    return () => window.removeEventListener('tool-guide-select', selectFromDirectory)
  }, [])

  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add({
      motion: '(prefers-reduced-motion: no-preference)',
      reduced: '(prefers-reduced-motion: reduce)',
    }, ({ conditions }) => {
      if (conditions?.motion) {
        gsap.from('.guide-heading > *', {
          autoAlpha: 0,
          y: 26,
          stagger: 0.1,
          scrollTrigger: { trigger: scope.current, start: 'top 72%', toggleActions: 'play none none reverse' },
        })
        gsap.from('.guide-tool-tab', {
          autoAlpha: 0,
          x: -22,
          stagger: 0.08,
          scrollTrigger: { trigger: '.guide-workspace', start: 'top 78%', toggleActions: 'play none none reverse' },
        })
      }

      const trigger = ScrollTrigger.create({
        trigger: scope.current,
        start: 'top bottom',
        end: 'bottom bottom',
        onUpdate: (self) => gsap.set(progress.current, { scaleX: self.progress }),
      })
      return () => trigger.kill()
    })
    return () => mm.revert()
  }, { scope })

  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const timeline = gsap.timeline()
      timeline
        .fromTo('.guide-chapter-copy > *', { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, stagger: 0.06, duration: 0.32 })
        .fromTo('.guide-step', { autoAlpha: 0, x: 18 }, { autoAlpha: 1, x: 0, stagger: 0.08, duration: 0.3 }, '<0.08')
        .fromTo('.guide-result-node', { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, stagger: 0.08, duration: 0.25 }, '<0.06')
      return () => timeline.kill()
    })
    ScrollTrigger.refresh()
    return () => mm.revert()
  }, { dependencies: [activeTool, activeChapter], scope, revertOnUpdate: true })

  const selectTool = (index: number) => {
    setActiveTool(index)
    setActiveChapter(0)
  }

  return (
    <section ref={scope} className="usage-guides" id="guide" data-scene="guide" data-scene-index="04" style={{ '--guide-accent': guide.accent } as CSSProperties}>
      <span ref={progress} className="guide-scroll-progress" aria-hidden="true" />
      <header className="guide-heading">
        <div>
          <span>使用手册 / SOURCE-GUIDED</span>
          <h2><ScrollFloatText><VariableProximity label="每个控件，都有清楚的使用路径" containerRef={scope} radius={145} /></ScrollFloatText></h2>
        </div>
        <p>说明内容来自三个工具当前源码。选择工具和章节，逐步查看输入、操作、结果与风险；完整版本可下载为 Markdown。</p>
        <a href="./docs/TOOLS_USAGE.md" download><Download />下载完整手册</a>
      </header>

      <div className="guide-workspace">
        <div className="guide-tool-tabs" role="tablist" aria-label="工具使用说明">
          {toolGuides.map((item, index) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={activeTool === index}
              className={`guide-tool-tab ${activeTool === index ? 'is-active' : ''}`}
              style={{ '--tab-accent': item.accent } as CSSProperties}
              onClick={() => selectTool(index)}
            >
              <span>0{index + 1}</span>
              <strong>{item.name}</strong>
              <small>{item.chapters.length} 个章节</small>
              <ArrowRight />
            </button>
          ))}
        </div>

        <div className="guide-tool-overview">
          <div className="guide-tool-title">
            <span>{guide.eyebrow}</span>
            <h3>{guide.name}</h3>
            <p>{guide.intro}</p>
          </div>
          <div className="guide-source"><FileCode2 /><span>说明依据</span><code>{guide.source}</code></div>
        </div>

        <div className="guide-body">
          <nav className="guide-chapter-nav" aria-label={`${guide.name} 章节`}>
            {guide.chapters.map((item, index) => (
              <button
                key={item.title}
                type="button"
                className={activeChapter === index ? 'is-active' : ''}
                aria-current={activeChapter === index ? 'step' : undefined}
                onClick={() => setActiveChapter(index)}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div><strong>{item.title}</strong><small>{item.summary}</small></div>
              </button>
            ))}
          </nav>

          <article className="guide-chapter-panel" aria-live="polite">
            <div className="guide-chapter-copy">
              <span>CHAPTER {String(activeChapter + 1).padStart(2, '0')}</span>
              <h3>{chapter.title}</h3>
              <p>{chapter.summary}</p>
            </div>
            <ol className="guide-steps">
              {chapter.steps.map((step, index) => (
                <li className="guide-step" key={step}>
                  <span>{index + 1}</span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
            <div className="guide-result">
              <span className="guide-result-node"><BookOpen /></span>
              <span className="guide-result-line" aria-hidden="true" />
              <span className="guide-result-node"><CheckCircle2 /></span>
              <div><small>预期结果</small><p>{chapter.result}</p></div>
            </div>
            {chapter.note ? <aside className="guide-note"><strong>注意</strong><p>{chapter.note}</p></aside> : null}
            <div className="guide-pager">
              <span>{activeChapter + 1} / {guide.chapters.length}</span>
              <button type="button" disabled={activeChapter === guide.chapters.length - 1} onClick={() => setActiveChapter((value) => Math.min(guide.chapters.length - 1, value + 1))}>
                下一章节<ArrowRight />
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
