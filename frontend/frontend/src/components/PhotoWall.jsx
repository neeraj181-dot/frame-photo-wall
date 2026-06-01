import { useState, useCallback, useEffect, useRef } from 'react'
import FrameCard from './FrameCard'

/**
 * PhotoWall
 *
 * Renders all frames in a CSS grid. Zoom changes the --cell-size CSS variable
 * which scales every cell — no transform:scale(), no blurry images, no
 * virtualization bugs. The browser's native scroll handles 1000+ items fine
 * with content-visibility: auto.
 *
 * Zoom: 50% – 300%, default 100%
 * Ctrl+Wheel or buttons to zoom.
 * Cell base size: 80px. At 100% zoom → 80px. At 200% → 160px. At 50% → 40px.
 */

const BASE_CELL  = 80    // px at 100% zoom
const GAP        = 4     // px gap (constant, not zoomed)
const MIN_ZOOM   = 0.5
const MAX_ZOOM   = 3.0
const ZOOM_STEP  = 0.1
const DEFAULT_ZOOM = 1.0

export default function PhotoWall({ frames, onFrameClick }) {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)
  const containerRef    = useRef(null)
  const filled          = frames.filter(f => f.image_url).length

  const clampZoom = (z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z))

  const zoomIn    = useCallback(() => setZoom(z => clampZoom(+(z + ZOOM_STEP).toFixed(2))), [])
  const zoomOut   = useCallback(() => setZoom(z => clampZoom(+(z - ZOOM_STEP).toFixed(2))), [])
  const resetZoom = useCallback(() => setZoom(DEFAULT_ZOOM), [])

  // Ctrl + Wheel zoom
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handler = (e) => {
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
      setZoom(z => clampZoom(+(z + delta).toFixed(2)))
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [])

  const cellSize = Math.round(BASE_CELL * zoom)
  const pct      = Math.round(zoom * 100)

  return (
    <div style={{ position: 'relative' }}>

      {/* ── Counter ── */}
      <div style={{
        textAlign: 'center',
        fontSize: '11px',
        color: '#A89880',
        fontWeight: '500',
        letterSpacing: '0.5px',
        marginBottom: '8px',
        userSelect: 'none',
      }}>
        {filled} / {frames.length} frames filled
      </div>

      {/* ── Scrollable wall container ── */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          overflowX: 'auto',
          overflowY: 'auto',
        }}
      >
        {/* Grid — cell size driven by zoom */}
        <div
          className="pw-grid"
          style={{ '--cell': cellSize + 'px', '--gap': GAP + 'px' }}
        >
          {frames.map((frame) => (
            <FrameCard
              key={frame.id}
              frame={frame}
              onClick={onFrameClick}
            />
          ))}
        </div>
      </div>

      {/* ── Floating zoom controls (bottom-right) ── */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 30,
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        background: 'rgba(245,241,234,0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(139,115,85,0.2)',
        borderRadius: '10px',
        padding: '6px 8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        userSelect: 'none',
      }}>
        <ZoomBtn onClick={zoomOut} disabled={zoom <= MIN_ZOOM} title="Zoom out (Ctrl+Scroll)">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </ZoomBtn>

        <span style={{
          fontSize: '11px',
          fontWeight: '700',
          color: '#5C4A32',
          minWidth: '36px',
          textAlign: 'center',
          letterSpacing: '0.3px',
        }}>
          {pct}%
        </span>

        <ZoomBtn onClick={zoomIn} disabled={zoom >= MAX_ZOOM} title="Zoom in (Ctrl+Scroll)">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </ZoomBtn>

        <div style={{ width: '1px', height: '16px', background: 'rgba(139,115,85,0.2)', margin: '0 2px' }} />

        <button
          onClick={resetZoom}
          title="Reset zoom to 100%"
          style={{
            padding: '4px 8px',
            borderRadius: '6px',
            border: 'none',
            background: zoom === DEFAULT_ZOOM ? 'transparent' : 'rgba(92,74,50,0.1)',
            color: '#5C4A32',
            fontSize: '10px',
            fontWeight: '700',
            fontFamily: 'inherit',
            cursor: 'pointer',
            letterSpacing: '0.3px',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(92,74,50,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = zoom === DEFAULT_ZOOM ? 'transparent' : 'rgba(92,74,50,0.1)'}
        >
          Reset
        </button>
      </div>

      {/* ── All CSS ── */}
      <style>{`
        .pw-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, var(--cell));
          gap: var(--gap);
          width: 100%;
          /* content-visibility lets the browser skip off-screen paint */
          contain: layout style;
        }

        /* Each cell is exactly --cell × --cell */
        .pw-grid > .fc {
          width:  var(--cell) !important;
          height: var(--cell) !important;
          aspect-ratio: unset !important;
        }

        /* Hover */
        .fc {
          transition: transform 0.16s cubic-bezier(0.22,1,0.36,1);
          will-change: transform;
          z-index: 0;
        }
        .fc:hover { transform: scale(1.06); z-index: 4; }
        .fc:active { transform: scale(0.96); }

        .fc:hover .fc-img     { transform: scale(1.08); }
        .fc:hover .fc-overlay { background: rgba(0,0,0,0.28) !important; }
        .fc:hover .fc-label   { opacity: 1 !important; }
        .fc:hover .fc-plus path { stroke: #8B6540; }
        .fc:hover .fc-num     { color: #8B6540; }

        .pw-grid { isolation: isolate; }
      `}</style>
    </div>
  )
}

function ZoomBtn({ onClick, disabled, title, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        width: '26px',
        height: '26px',
        borderRadius: '6px',
        border: 'none',
        background: 'transparent',
        color: disabled ? '#C4B49A' : '#5C4A32',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.15s',
        flexShrink: 0,
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = 'rgba(92,74,50,0.1)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
    >
      {children}
    </button>
  )
}
