import { useEffect, useRef } from 'react'

type Particle = { x: number; y: number; vx: number; vy: number; size: number; life: number; hue: number }
type Ripple = { x: number; y: number; radius: number; life: number }

export function CursorEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const finePointer = window.matchMedia('(pointer: fine)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!finePointer.matches || reducedMotion.matches) return

    const context = canvas.getContext('2d')
    if (!context) return

    const particles: Particle[] = []
    const ripples: Ripple[] = []
    const previous = { x: -100, y: -100 }
    let frame = 0
    let width = window.innerWidth
    let height = window.innerHeight
    let ratio = 1

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      ratio = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const ensureFrame = () => {
      if (!frame) frame = requestAnimationFrame(render)
    }

    const addParticle = (x: number, y: number, velocityX: number, velocityY: number, burst = false) => {
      particles.push({
        x,
        y,
        vx: velocityX * (burst ? 0.05 : 0.025) + (Math.random() - 0.5) * (burst ? 3.4 : 0.9),
        vy: velocityY * (burst ? 0.05 : 0.025) + (Math.random() - 0.5) * (burst ? 3.4 : 0.9),
        size: burst ? 3 + Math.random() * 5 : 2 + Math.random() * 3,
        life: burst ? 1 : 0.72,
        hue: 168 + Math.random() * 28,
      })
    }

    const render = () => {
      frame = 0
      context.clearRect(0, 0, width, height)

      for (let index = ripples.length - 1; index >= 0; index -= 1) {
        const ripple = ripples[index]
        ripple.radius += 4.6
        ripple.life -= 0.045
        if (ripple.life <= 0) {
          ripples.splice(index, 1)
          continue
        }
        context.beginPath()
        context.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2)
        context.strokeStyle = `hsla(176, 88%, 70%, ${ripple.life * 0.5})`
        context.lineWidth = 1.2 + ripple.life * 1.3
        context.stroke()
      }

      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index]
        particle.x += particle.vx
        particle.y += particle.vy
        particle.vx *= 0.97
        particle.vy *= 0.97
        particle.life -= 0.024
        if (particle.life <= 0) {
          particles.splice(index, 1)
          continue
        }
        const glow = context.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.size * 3.2)
        glow.addColorStop(0, `hsla(${particle.hue}, 94%, 72%, ${particle.life * 0.75})`)
        glow.addColorStop(1, `hsla(${particle.hue}, 94%, 62%, 0)`)
        context.fillStyle = glow
        context.beginPath()
        context.arc(particle.x, particle.y, particle.size * 3.2, 0, Math.PI * 2)
        context.fill()
      }

      if (particles.length || ripples.length) ensureFrame()
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      const velocityX = event.clientX - previous.x
      const velocityY = event.clientY - previous.y
      if (Math.hypot(velocityX, velocityY) > 9) {
        addParticle(event.clientX, event.clientY, velocityX, velocityY)
        previous.x = event.clientX
        previous.y = event.clientY
        ensureFrame()
      }
    }

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      ripples.push({ x: event.clientX, y: event.clientY, radius: 8, life: 1 })
      for (let index = 0; index < 12; index += 1) addParticle(event.clientX, event.clientY, 0, 0, true)
      ensureFrame()
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerdown', onPointerDown)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return <canvas ref={canvasRef} className="cursor-effects" aria-hidden="true" />
}
