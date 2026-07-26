import { useRef, type ReactNode } from 'react'
import { gsap, useGSAP } from '../animation/gsap'

type ScrollFloatTextProps = { children: ReactNode; className?: string }

export function ScrollFloatText({ children, className = '' }: ScrollFloatTextProps) {
  const scope = useRef<HTMLSpanElement>(null)

  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add({ desktop: '(min-width: 900px) and (pointer: fine)', motion: '(prefers-reduced-motion: no-preference)' }, ({ conditions }) => {
      if (!conditions?.desktop || !conditions.motion || !scope.current) return
      const timeline = gsap.timeline({
        scrollTrigger: { trigger: scope.current, start: 'top 90%', end: 'bottom 12%', scrub: 0.55 },
      })
      timeline
        .fromTo(scope.current, { y: 42, autoAlpha: 0.16, rotation: .55 }, { y: 0, autoAlpha: 1, rotation: 0, duration: .34, ease: 'none' })
        .to(scope.current, { y: -38, autoAlpha: 0.18, rotation: -.45, duration: .3, ease: 'none' }, .64)
      return () => timeline.kill()
    })
    return () => mm.revert()
  }, { scope })

  return <span ref={scope} className={`scroll-float-text ${className}`.trim()}>{children}</span>
}
