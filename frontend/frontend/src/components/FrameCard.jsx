import { memo } from 'react'

/**
 * FrameCard — one tile in the photo wall grid.
 *
 * Props: frame, onClick
 * Size comes from the CSS grid cell — no explicit size prop needed.
 * Uses React.memo so 1000 cards don't re-render on unrelated state changes.
 */
const FrameCard = memo(function FrameCard({ frame, onClick }) {
  const hasImage = !!frame.image_url

  return (
    <button
      onClick={() => onClick(frame)}
      className="fc"
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1 / 1',
        padding: 0,
        margin: 0,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        display: 'block',
        borderRadius: '2px',
        userSelect: 'none',
      }}
      aria-label={`Frame ${frame.slot_number}${hasImage ? ', has photo' : ', empty'}`}
    >
      {/* Frame border */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '2px',
        border: '1.5px solid #C8B898',
        background: hasImage ? 'transparent' : '#EDE8DF',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden',
      }}>
        {hasImage ? (
          <>
            <img
              src={frame.image_url}
              alt={`Frame ${frame.slot_number}`}
              loading="lazy"
              className="fc-img"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                transition: 'transform 0.25s ease',
                pointerEvents: 'none',
              }}
            />
            <div className="fc-overlay" style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0)',
              transition: 'background 0.18s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span className="fc-label" style={{
                color: '#fff',
                fontSize: '8px',
                fontWeight: '700',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                opacity: 0,
                transition: 'opacity 0.18s ease',
                textShadow: '0 1px 3px rgba(0,0,0,0.7)',
                pointerEvents: 'none',
              }}>Open</span>
            </div>
          </>
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
          }}>
            <svg className="fc-plus" width="9" height="9" viewBox="0 0 10 10" fill="none"
              style={{ pointerEvents: 'none' }}>
              <path d="M5 1v8M1 5h8" stroke="#C4B49A" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <span className="fc-num" style={{
              fontSize: '6px',
              fontWeight: '600',
              color: '#D4C8B4',
              lineHeight: 1,
              pointerEvents: 'none',
            }}>{frame.slot_number}</span>
          </div>
        )}
      </div>
    </button>
  )
})

export default FrameCard
