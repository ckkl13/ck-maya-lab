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
    let currentX = 0
    let currentY = 0
    let targetX = 0
    let targetY = 0
    let returning = false

    const render = () => {
      const follow = returning ? 0.13 : 0.22
      currentX += (targetX - currentX) * follow
      currentY += (targetY - currentY) * follow

      const settled = Math.abs(targetX - currentX) < 0.002 && Math.abs(targetY - currentY) < 0.002
      if (settled) {
        currentX = targetX
        currentY = targetY
        returning = false
      }

      root.style.setProperty('--pointer-far-x', `${currentX * 5}px`)
      root.style.setProperty('--pointer-far-y', `${currentY * 4}px`)
      root.style.setProperty('--pointer-mid-x', `${currentX * 11}px`)
      root.style.setProperty('--pointer-mid-y', `${currentY * 8}px`)
      root.style.setProperty('--pointer-near-x', `${currentX * 18}px`)
      root.style.setProperty('--pointer-near-y', `${currentY * 13}px`)
      root.style.setProperty('--pointer-light-x', `${(currentX + 1) * 50}%`)
      root.style.setProperty('--pointer-light-y', `${(currentY + 1) * 50}%`)
      root.style.setProperty('--global-pointer-x', `${(currentX + 1) * 50}%`)
      root.style.setProperty('--global-pointer-y', `${(currentY + 1) * 50}%`)

      if (settled) {
        frame = 0
        return
      }

      frame = requestAnimationFrame(render)
    }

    const queueRender = () => {
      if (!frame) frame = requestAnimationFrame(render)
    }

    const onPointerMove = (event: PointerEvent) => {
      if (reduced.matches || !finePointer.matches) return
      if (options.viewport) {
        targetX = (event.clientX / window.innerWidth - 0.5) * 2
        targetY = (event.clientY / window.innerHeight - 0.5) * 2
      } else {
        const bounds = root.getBoundingClientRect()
        targetX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2
        targetY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2
      }
      returning = false
      queueRender()
    }

    const reset = () => {
      targetX = 0
      targetY = 0
      returning = true
      queueRender()
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
