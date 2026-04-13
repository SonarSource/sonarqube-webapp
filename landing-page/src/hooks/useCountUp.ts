import { useEffect, useState } from 'react'

export function useCountUp(
  end: number,
  shouldStart: boolean,
  duration = 2000,
  prefix = '',
  suffix = '',
  decimals = 0,
) {
  const [display, setDisplay] = useState(`${prefix}0${suffix}`)

  useEffect(() => {
    if (!shouldStart) return

    const startTime = performance.now()
    let raf: number

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = eased * end

      setDisplay(`${prefix}${current.toFixed(decimals)}${suffix}`)

      if (progress < 1) {
        raf = requestAnimationFrame(tick)
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [shouldStart, end, duration, prefix, suffix, decimals])

  return display
}
