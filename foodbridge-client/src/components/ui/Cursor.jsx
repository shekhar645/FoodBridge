// This component adds the orange cursor trail effect
// Import it once in App.jsx and it works everywhere

import { useEffect } from 'react'

export default function Cursor() {
  useEffect(() => {
    const dot  = document.getElementById('cursor-dot')
    const ring = document.getElementById('cursor-ring')

    if (!dot || !ring) return

    // Move cursor elements to follow mouse
    const onMouseMove = (e) => {
      dot.style.left  = e.clientX + 'px'
      dot.style.top   = e.clientY + 'px'
      ring.style.left = e.clientX + 'px'
      ring.style.top  = e.clientY + 'px'
    }

    // Grow ring when hovering clickable elements
    const onMouseOver = (e) => {
      const target = e.target.closest('a, button, [role="button"], input, textarea')
      if (target) ring.classList.add('hovered')
    }

    const onMouseOut = (e) => {
      const target = e.target.closest('a, button, [role="button"], input, textarea')
      if (target) ring.classList.remove('hovered')
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseover', onMouseOver)
    window.addEventListener('mouseout',  onMouseOut)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseover', onMouseOver)
      window.removeEventListener('mouseout',  onMouseOut)
    }
  }, [])

  // This component renders nothing — it just runs the effect
  return null
}