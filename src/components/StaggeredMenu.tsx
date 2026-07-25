import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { gsap, useGSAP } from '../animation/gsap'
import './StaggeredMenu.css'

interface StaggeredMenuProps {
  open: boolean
  titleId: string
  onClose: () => void
  children: ReactNode
}

export function StaggeredMenu({ open, titleId, onClose, children }: StaggeredMenuProps) {
  const scope = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLElement>(null)
  const backdrop = useRef<HTMLButtonElement>(null)
  const timeline = useRef<gsap.core.Timeline | null>(null)
  const reducedMotion = useRef(false)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  useGSAP(() => {
    const root = scope.current
    const menu = panel.current
    const shade = backdrop.current
    const layers = root?.querySelectorAll('.staggered-menu-layer')
    if (!root || !menu || !shade || !layers) return

    reducedMotion.current = matchMedia('(prefers-reduced-motion: reduce)').matches
    gsap.set(root, { autoAlpha: 0 })
    gsap.set(shade, { autoAlpha: 0 })
    gsap.set([menu, ...layers], { x: 0, xPercent: -105 })
    root.style.pointerEvents = 'none'

    if (reducedMotion.current) return

    timeline.current = gsap.timeline({
      paused: true,
      defaults: { ease: 'power3.inOut' },
      onStart: () => {
        root.style.pointerEvents = 'auto'
      },
      onReverseComplete: () => {
        gsap.set(root, { autoAlpha: 0 })
        root.style.pointerEvents = 'none'
      },
    })
      .set(root, { autoAlpha: 1 }, 0)
      .to(shade, { autoAlpha: 1, duration: 0.28 }, 0)
      .to(layers, { xPercent: 0, stagger: 0.055, duration: 0.48 }, 0)
      .to(menu, { xPercent: 0, duration: 0.58 }, 0.1)
      .fromTo('.tool-directory-card', { autoAlpha: 0, x: -18 }, { autoAlpha: 1, x: 0, stagger: 0.07, duration: 0.32 }, 0.3)

    return () => {
      timeline.current?.kill()
      timeline.current = null
    }
  }, { scope })

  useEffect(() => {
    const root = scope.current
    const menu = panel.current
    const shade = backdrop.current
    const layers = root?.querySelectorAll('.staggered-menu-layer')
    if (!root || !menu || !shade || !layers) return

    if (reducedMotion.current) {
      gsap.set([menu, ...layers], { x: 0, xPercent: open ? 0 : -105 })
      gsap.set(shade, { autoAlpha: open ? 1 : 0 })
      gsap.set(root, { autoAlpha: open ? 1 : 0 })
      root.style.pointerEvents = open ? 'auto' : 'none'
      return
    }

    if (open) timeline.current?.play()
    else timeline.current?.reverse()
  }, [open])

  return createPortal(
    <div ref={scope} className="staggered-menu" data-side="left" aria-hidden={!open} inert={!open}>
      <button ref={backdrop} className="staggered-menu-backdrop" type="button" aria-label="关闭工具目录" tabIndex={open ? 0 : -1} onClick={onClose} />
      <div className="staggered-menu-layer is-far" aria-hidden="true" />
      <div className="staggered-menu-layer is-near" aria-hidden="true" />
      <aside ref={panel} className="staggered-menu-panel" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        {children}
      </aside>
    </div>,
    document.getElementById('root') ?? document.body,
  )
}
