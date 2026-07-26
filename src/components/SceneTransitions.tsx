import { useRef } from 'react'
import { ScrollTrigger, gsap, useGSAP } from '../animation/gsap'

const sceneNames: Record<string, string> = {
  hero: 'INTRO',
  works: 'TOOLS',
  studio: 'STUDIO',
  guide: 'GUIDE',
  downloads: 'DOWNLOAD',
}

export function SceneTransitions() {
  const indicatorRef = useRef<HTMLElement>(null)
  const indexRef = useRef<HTMLSpanElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const progressRef = useRef<HTMLSpanElement>(null)

  useGSAP(() => {
    const root = document.querySelector<HTMLElement>('.app-main')
    if (!root) return

    const scenes = gsap.utils.toArray<HTMLElement>('[data-scene]', root)
    const background = document.querySelector<HTMLElement>('.global-interactive-background')
    const mm = gsap.matchMedia()
    let activeScene = ''

    const findSceneAtViewportCenter = () => {
      const viewportCenter = window.innerHeight / 2
      let closestScene = scenes[0]
      let closestDistance = Number.POSITIVE_INFINITY

      scenes.forEach((scene) => {
        const bounds = scene.getBoundingClientRect()
        if (bounds.top <= viewportCenter && bounds.bottom >= viewportCenter) {
          closestScene = scene
          closestDistance = 0
          return
        }
        const distance = Math.min(Math.abs(bounds.top - viewportCenter), Math.abs(bounds.bottom - viewportCenter))
        if (distance < closestDistance) {
          closestScene = scene
          closestDistance = distance
        }
      })

      return closestScene
    }

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
                y: -82,
                rotation: -1.2,
                autoAlpha: 0,
                scale: 0.94,
                transformOrigin: '50% 50%',
                ease: 'none',
                scrollTrigger: {
                  trigger: scene,
                  start: '35% top',
                  end: 'bottom 18%',
                  scrub: 0.6,
                },
              })
            } else {
              const timeline = gsap.timeline({
                scrollTrigger: {
                  trigger: scene,
                  start: 'top 94%',
                  end: 'bottom 28%',
                  scrub: 0.65,
                },
              })
              timeline
                .fromTo(scene,
                  { y: 96, rotation: 1.1, autoAlpha: 0, scale: 0.94, transformOrigin: '50% 50%' },
                  { y: 0, rotation: 0, autoAlpha: 1, scale: 1, duration: 0.34, ease: 'none' },
                )
                .to(scene, { y: -96, rotation: -1.1, autoAlpha: 0, scale: 0.94, duration: 0.4, ease: 'none' }, 0.58)
            }
          })
        }

        const progressTrigger = ScrollTrigger.create({
          trigger: document.documentElement,
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: ({ progress }) => {
            activate(findSceneAtViewportCenter())
            if (progressRef.current) gsap.set(progressRef.current, { scaleY: progress })
            if (background && conditions?.motion) {
              background.style.setProperty('--global-scroll-y', `${progress * -72}px`)
            }
          },
        })

        activate(findSceneAtViewportCenter())
        return () => progressTrigger.kill()
      },
    )

    return () => {
      mm.revert()
      background?.style.removeProperty('--global-scroll-y')
    }
  }, { scope: indicatorRef })

  return (
    <aside ref={indicatorRef} className="scene-indicator" aria-hidden="true">
      <span ref={indexRef} className="scene-indicator-index">01</span>
      <span ref={labelRef} className="scene-indicator-label">INTRO</span>
      <i><span ref={progressRef} /></i>
      <small>05</small>
    </aside>
  )
}
