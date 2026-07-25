import { useEffect, type RefObject } from 'react'

export function usePointerField(scope: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = scope.current
    if (!root) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const finePointer = window.matchMedia('(pointer: fine)')
    let frame = 0
    let nextX = 0
    let nextY = 0

    const render = () => {
      frame = 0
      root.style.setProperty('--pointer-far-x', `${nextX * 5}px`)
      root.style.setProperty('--pointer-far-y', `${nextY * 4}px`)
      root.style.setProperty('--pointer-mid-x', `${nextX * 11}px`)
      root.style.setProperty('--pointer-mid-y', `${nextY * 8}px`)
      root.style.setProperty('--pointer-near-x', `${nextX * 18}px`)
      root.style.setProperty('--pointer-near-y', `${nextY * 13}px`)
      root.style.setProperty('--pointer-light-x', `${(nextX + 1) * 50}%`)
      root.style.setProperty('--pointer-light-y', `${(nextY + 1) * 50}%`)
    }

    const onPointerMove = (event: PointerEvent) => {
      if (reduced.matches || !finePointer.matches) return
      const bounds = root.getBoundingClientRect()
      nextX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2
      nextY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2
      if (!frame) frame = requestAnimationFrame(render)
    }

    const reset = () => {
      nextX = 0
      nextY = 0
      if (!frame) frame = requestAnimationFrame(render)
    }

    root.addEventListener('pointermove', onPointerMove)
    root.addEventListener('pointerleave', reset)
    return () => {
      root.removeEventListener('pointermove', onPointerMove)
      root.removeEventListener('pointerleave', reset)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [scope])
}
