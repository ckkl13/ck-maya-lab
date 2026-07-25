import { useRef, type RefObject } from 'react'
import { ScrollTrigger, gsap, useGSAP } from '../animation/gsap'

type SceneTransitionsProps = {
  scope: RefObject<HTMLElement | null>
}

const sceneNames: Record<string, string> = {
  hero: 'INTRO',
  works: 'TOOLS',
  studio: 'STUDIO',
  guide: 'GUIDE',
  downloads: 'DOWNLOAD',
}

export function SceneTransitions({ scope }: SceneTransitionsProps) {
  const indexRef = useRef<HTMLSpanElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const progressRef = useRef<HTMLSpanElement>(null)

  useGSAP(() => {
    const root = scope.current
    if (!root) return

    const scenes = gsap.utils.toArray<HTMLElement>('[data-scene]', root)
    const background = document.querySelector<HTMLElement>('.global-interactive-background')
    const scanLine = document.querySelector<HTMLElement>('.global-scan-line')
    const mm = gsap.matchMedia()
    let activeScene = ''

    const activate = (scene: HTMLElement) => {
      const name = scene.dataset.scene ?? 'hero'
      if (name === activeScene) return
      activeScene = name
      const index = scene.dataset.sceneIndex ?? '01'
      const position = Math.max(0, scenes.indexOf(scene))

      if (indexRef.current) indexRef.current.textContent = index
      if (labelRef.current) labelRef.current.textContent = sceneNames[name] ?? name.toUpperCase()
      if (background) {
        gsap.to(background, {
          '--scene-glow-x': `${28 + position * 12}%`,
          '--scene-glow-y': `${24 + (position % 2) * 48}%`,
          '--scene-particle-opacity': 0.32 + (position % 3) * 0.08,
          duration: 0.85,
          ease: 'power2.out',
          overwrite: true,
        })
      }
      if (scanLine && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.fromTo(scanLine,
          { autoAlpha: 0, y: -40 },
          { autoAlpha: 0.72, y: window.innerHeight + 40, duration: 0.85, ease: 'power2.inOut', overwrite: true },
        )
      }
    }

    mm.add(
      {
        desktop: '(min-width: 900px) and (pointer: fine)',
        motion: '(prefers-reduced-motion: no-preference)',
      },
      ({ conditions }) => {
        if (conditions?.motion) {
          scenes.forEach((scene, index) => {
            if (index === 0) {
              gsap.to(scene, {
                y: -12,
                autoAlpha: 0.88,
                scale: 0.985,
                ease: 'none',
                scrollTrigger: {
                  trigger: scene,
                  start: '35% top',
                  end: 'bottom top',
                  scrub: 0.6,
                },
              })
            } else {
              const timeline = gsap.timeline({
                scrollTrigger: {
                  trigger: scene,
                  start: 'top 94%',
                  end: 'bottom top',
                  scrub: 0.65,
                },
              })
              timeline
                .fromTo(scene,
                  { y: 38, autoAlpha: 0.82, scale: 0.992 },
                  { y: 0, autoAlpha: 1, scale: 1, duration: 0.24, ease: 'none' },
                )
                .to(scene, { y: -12, autoAlpha: 0.88, scale: 0.985, duration: 0.2, ease: 'none' }, 0.8)
            }
          })
        }

        scenes.forEach((scene) => {
          ScrollTrigger.create({
            trigger: scene,
            start: 'top center',
            end: 'bottom center',
            onEnter: () => activate(scene),
            onEnterBack: () => activate(scene),
          })
        })

        const progressTrigger = ScrollTrigger.create({
          trigger: document.documentElement,
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: ({ progress }) => {
            if (progressRef.current) gsap.set(progressRef.current, { scaleY: progress })
            if (background && conditions?.motion) {
              background.style.setProperty('--global-scroll-y', `${progress * -72}px`)
            }
          },
        })

        activate(scenes[0])
        return () => progressTrigger.kill()
      },
    )

    return () => {
      mm.revert()
      background?.style.removeProperty('--global-scroll-y')
    }
  }, { scope })

  return (
    <aside className="scene-indicator" aria-hidden="true">
      <span ref={indexRef} className="scene-indicator-index">01</span>
      <span ref={labelRef} className="scene-indicator-label">INTRO</span>
      <i><span ref={progressRef} /></i>
      <small>05</small>
    </aside>
  )
}
