"use client"
import { useEffect, useRef } from "react"

const SLIDE_IDS = ["slide1","slide2","slide3","slide4","slide5","slide6","slide7"]
const INTERVAL = 10000

interface CarouselNavProps {
  targetId: string
  children: React.ReactNode
}

export default function CarouselNav({ targetId, children }: CarouselNavProps) {
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const scrollTo = (id: string) => {
    const carousel = document.querySelector(".carrucel")
    const target = document.getElementById(id)
    if (carousel && target) {
      carousel.scrollTo({ left: target.offsetLeft, behavior: "smooth" })
    }
  }

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      const current = SLIDE_IDS.findIndex(id => {
        const el = document.getElementById(id)
        if (!el) return false
        const rect = el.getBoundingClientRect()
        return rect.left >= -1 && rect.left <= 1
      })
      const next = (current + 1) % SLIDE_IDS.length
      scrollTo(SLIDE_IDS[next])
    }, INTERVAL)
  }

  useEffect(() => {
    resetTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const handleClick = () => {
    scrollTo(targetId)
    resetTimer()
  }

  return (
    <button onClick={handleClick} className="btn btn-circle">
      {children}
    </button>
  )
}
