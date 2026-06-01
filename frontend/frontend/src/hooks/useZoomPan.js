/**
 * useZoomPan
 * Manages zoom level and pan offset for the photo wall canvas.
 *
 * Zoom: 0.25 – 3.0  (25% – 300%), default 1.0
 * Pan:  { x, y } pixel offset of the inner canvas
 *
 * Exposes:
 *   zoom, pan
 *   zoomIn(), zoomOut(), resetView()
 *   setZoom(n)
 *   containerRef  — attach to the scroll/pan container div
 *   onWheel       — attach to the container for Ctrl+Wheel zoom
 *   dragHandlers  — { onMouseDown, onMouseMove, onMouseUp, onMouseLeave }
 *                   attach to the container for click-drag panning
 */
import { useState, useRef, useCallback } from 'react'

const MIN_ZOOM  = 0.25
const MAX_ZOOM  = 3.0
const ZOOM_STEP = 0.15

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max)
}

export default function useZoomPan() {
  const [zoom, setZoomState] = useState(1.0)
  const [pan,  setPan]       = useState({ x: 0, y: 0 })
  const containerRef = useRef(null)

  // ── Drag state (refs, not state — no re-render during drag) ──
  const dragging   = useRef(false)
  const dragStart  = useRef({ mx: 0, my: 0, px: 0, py: 0 })

  // ── Zoom helpers ──────────────────────────────────────────────
  const setZoom = useCallback((next) => {
    setZoomState(clamp(typeof next === 'function' ? next(zoom) : next, MIN_ZOOM, MAX_ZOOM))
  }, [zoom])

  const zoomIn    = useCallback(() => setZoom(z => clamp(z + ZOOM_STEP, MIN_ZOOM, MAX_ZOOM)), [setZoom])
  const zoomOut   = useCallback(() => setZoom(z => clamp(z - ZOOM_STEP, MIN_ZOOM, MAX_ZOOM)), [setZoom])
  const resetView = useCallback(() => { setZoomState(1.0); setPan({ x: 0, y: 0 }) }, [])

  // ── Ctrl + Wheel zoom (zoom toward cursor) ────────────────────
  const onWheel = useCallback((e) => {
    if (!e.ctrlKey && !e.metaKey) return
    e.preventDefault()

    const container = containerRef.current
    if (!container) return

    const rect    = container.getBoundingClientRect()
    const mouseX  = e.clientX - rect.left
    const mouseY  = e.clientY - rect.top
    const delta   = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP

    setZoomState(prev => {
      const next = clamp(prev + delta, MIN_ZOOM, MAX_ZOOM)
      // Adjust pan so the point under the cursor stays fixed
      const scale = next / prev
      setPan(p => ({
        x: mouseX - scale * (mouseX - p.x),
        y: mouseY - scale * (mouseY - p.y),
      }))
      return next
    })
  }, [])

  // ── Click-drag pan ────────────────────────────────────────────
  const onMouseDown = useCallback((e) => {
    // Only drag on left-button, not on interactive children
    if (e.button !== 0) return
    if (e.target.closest('button, a, input')) return
    dragging.current  = true
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y }
    e.currentTarget.style.cursor = 'grabbing'
  }, [pan])

  const onMouseMove = useCallback((e) => {
    if (!dragging.current) return
    const dx = e.clientX - dragStart.current.mx
    const dy = e.clientY - dragStart.current.my
    setPan({ x: dragStart.current.px + dx, y: dragStart.current.py + dy })
  }, [])

  const stopDrag = useCallback((e) => {
    if (!dragging.current) return
    dragging.current = false
    if (e.currentTarget) e.currentTarget.style.cursor = 'grab'
  }, [])

  const dragHandlers = {
    onMouseDown,
    onMouseMove,
    onMouseUp:    stopDrag,
    onMouseLeave: stopDrag,
  }

  return {
    zoom,
    pan,
    setZoom,
    zoomIn,
    zoomOut,
    resetView,
    containerRef,
    onWheel,
    dragHandlers,
    MIN_ZOOM,
    MAX_ZOOM,
  }
}
