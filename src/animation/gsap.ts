import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(useGSAP, ScrollTrigger)
gsap.defaults({ duration: 0.45, ease: 'power2.out' })

export { ScrollTrigger, gsap, useGSAP }
