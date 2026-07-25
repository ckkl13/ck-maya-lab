import { useRef, useState } from 'react'
import { ArrowDown, MoveDownRight } from 'lucide-react'
import { gsap, useGSAP } from '../animation/gsap'
import { tools } from '../data/tools'
import { usePointerField } from '../hooks/usePointerField'
import { TiltedCard } from './TiltedCard'

const frames = [
  { className: 'hero-frame-rig', src: './media/exhibition/rig-box.png', alt: 'CK Rig Box Maya 界面' },
  { className: 'hero-frame-ck', src: './media/exhibition/ck-tool.png', alt: 'CK Tool Maya 界面' },
  { className: 'hero-frame-scripts', src: './media/exhibition/scripts-box.png', alt: 'Scripts Box Maya 界面' },
]

export function HeroExhibition() {
  const scope = useRef<HTMLElement>(null)
  const [activeFrame, setActiveFrame] = useState<string | null>(null)
  usePointerField(scope)

  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add({ desktop: '(min-width: 900px)', motion: '(prefers-reduced-motion: no-preference)' }, ({ conditions }) => {
      if (!conditions?.motion) return
      const timeline = gsap.timeline()
      timeline
        .from('.hero-kicker', { autoAlpha: 0, x: -18, duration: 0.55 })
        .from('.hero-title-line', { autoAlpha: 0, yPercent: 108, stagger: 0.09, duration: 0.8, ease: 'power3.out' }, '<0.08')
        .from('.hero-summary > *', { autoAlpha: 0, y: 16, stagger: 0.08, duration: 0.5 }, '<0.22')
        .from('.hero-frame', { autoAlpha: 0, scale: 0.94, y: 24, stagger: 0.13, duration: 0.72 }, '<0.05')
        .from('.hero-index', { autoAlpha: 0, x: 20, duration: 0.45 }, '<0.22')

      if (conditions.desktop) {
        gsap.to('.hero-artwork-inner', {
          yPercent: 7,
          ease: 'none',
          scrollTrigger: { trigger: scope.current, start: 'top top', end: 'bottom top', scrub: 0.7 },
        })
      }
      return () => timeline.kill()
    })
    return () => mm.revert()
  }, { scope })

  return (
    <section ref={scope} className="hero-exhibition" id="top" data-scene="hero" data-scene-index="01">
      <div className="hero-field" aria-hidden="true" />
      <div className="hero-copy">
        <p className="hero-kicker"><span>数字艺术工具展览</span><span>2026 / MAYA</span></p>
        <h1>
          <span className="hero-title-mask"><span className="hero-title-line">TOOLS FOR</span></span>
          <span className="hero-title-mask is-offset"><span className="hero-title-line">DIGITAL RIGGING</span></span>
        </h1>
        <div className="hero-summary">
          <p>把 Maya 绑定与脚本工具当作数字作品展示。进入真实界面，理解每一个控件，再下载到自己的工作流。</p>
          <div><span>03 件工具</span><span>{tools[0].mayaVersions}</span><span>{tools[0].platforms}</span></div>
          <a href="#works">进入展览<ArrowDown /></a>
        </div>
      </div>

      <div className="hero-artwork" aria-label="三套 Maya 工具界面预览">
        <div className="hero-artwork-inner">
          <div className="hero-orbit hero-depth-far" aria-hidden="true" />
          {frames.map((frame) => (
            <TiltedCard
              key={frame.className}
              className={`hero-frame ${frame.className} ${activeFrame === frame.className ? 'is-active' : ''}`}
              imageSrc={frame.src}
              altText={frame.alt}
              onActiveChange={(active) => setActiveFrame((current) => active ? frame.className : current === frame.className ? null : current)}
            />
          ))}
          <span className="hero-index">01—03</span>
          <MoveDownRight className="hero-direction" aria-hidden="true" />
        </div>
      </div>
      <p className="hero-edge-label">INTERACTIVE MAYA TOOL ARCHIVE · CK MAYA LAB</p>
    </section>
  )
}
