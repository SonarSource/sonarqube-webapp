import { useEffect, useRef, useState } from 'react'

export function useInView(threshold = 0.15, once = true) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once) observer.unobserve(el)
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { threshold },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, once])

  return { ref, isVisible }
}
