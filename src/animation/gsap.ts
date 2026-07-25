import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { Flip } from 'gsap/Flip'
import { Draggable } from 'gsap/Draggable'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(useGSAP, Flip, Draggable, ScrollTrigger)
gsap.defaults({ duration: 0.45, ease: 'power2.out' })

export { Draggable, Flip, ScrollTrigger, gsap, useGSAP }
