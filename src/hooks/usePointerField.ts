import { useEffect, type RefObject } from 'react'

type PointerFieldOptions = {
  viewport?: boolean
}

export function usePointerField(scope: RefObject<HTMLElement | null>, options: PointerFieldOptions = {}) {
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
      root.style.setProperty('--global-pointer-x', `${(nextX + 1) * 50}%`)
      root.style.setProperty('--global-pointer-y', `${(nextY + 1) * 50}%`)
    }

    const onPointerMove = (event: PointerEvent) => {
      if (reduced.matches || !finePointer.matches) return
      if (options.viewport) {
        nextX = (event.clientX / window.innerWidth - 0.5) * 2
        nextY = (event.clientY / window.innerHeight - 0.5) * 2
      } else {
        const bounds = root.getBoundingClientRect()
        nextX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2
        nextY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2
      }
      if (!frame) frame = requestAnimationFrame(render)
    }

    const reset = () => {
      nextX = 0
      nextY = 0
      if (!frame) frame = requestAnimationFrame(render)
    }

    const target = options.viewport ? window : root
    target.addEventListener('pointermove', onPointerMove as EventListener)
    target.addEventListener('pointerleave', reset)
    if (options.viewport) window.addEventListener('blur', reset)
    return () => {
      target.removeEventListener('pointermove', onPointerMove as EventListener)
      target.removeEventListener('pointerleave', reset)
      if (options.viewport) window.removeEventListener('blur', reset)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [options.viewport, scope])
}
