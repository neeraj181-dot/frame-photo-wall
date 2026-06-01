import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import PhotoWall from '../components/PhotoWall'
import AuthModal from '../components/AuthModal'
import FrameModal from '../components/FrameModal'

/**
 * WallPage
 * The entire application — a full-viewport photo wall.
 * No max-width, no centered layout, no large margins.
 * The wall IS the website.
 *
 * Slim inline header (44px) sits above the wall.
 * Everything else is the grid.
 */
export default function WallPage() {
  const { user, loading: authLoading } = useAuth()

  const [frames,       setFrames]       = useState([])
  const [loadingWall,  setLoadingWall]  = useState(true)
  const [wallError,    setWallError]    = useState('')
  const [showAuth,     setShowAuth]     = useState(false)
  const [activeFrame,  setActiveFrame]  = useState(null)
  const [pendingFrame, setPendingFrame] = useState(null)

  const loadFrames = useCallback(async () => {
    setLoadingWall(true)
    setWallError('')
    try {
      const { data } = await api.get('/frames/')
      setFrames(data)
    } catch {
      setWallError('Cannot connect to server. Is the Django backend running on port 8000?')
    } finally {
      setLoadingWall(false)
    }
  }, [])

  useEffect(() => { loadFrames() }, [loadFrames])

  const handleFrameClick = (frame) => {
    if (!user) {
      setPendingFrame(frame)
      setShowAuth(true)
    } else {
      setActiveFrame(frame)
    }
  }

  const handleAuthSuccess = () => {
    setShowAuth(false)
    if (pendingFrame) { setActiveFrame(pendingFrame); setPendingFrame(null) }
  }

  const handleFrameUpdated = (updated) => {
    setFrames(prev => prev.map(f => f.id === updated.id ? updated : f))
  }

  const isLoading = loadingWall || authLoading
  const filled    = frames.filter(f => f.image_url).length

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: '#EDE8DF',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* ── Slim header ── */}
      <header style={{
        width: '100%',
        height: '44px',
        flexShrink: 0,
        background: 'rgba(237,232,223,0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(139,115,85,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '22px', height: '22px',
            border: '2px solid #5C4A32',
            borderRadius: '3px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '1.5px 1.5px 0 #3a2e1e',
          }}>
            <div style={{ width: '8px', height: '8px', background: '#5C4A32', borderRadius: '1px' }} />
          </div>
          <span style={{ fontSize: '15px', fontWeight: '700', color: '#2C1810', letterSpacing: '-0.4px' }}>
            Frame
          </span>
          {!isLoading && (
            <span style={{
              fontSize: '10px', color: '#A89880', fontWeight: '500',
              marginLeft: '4px', letterSpacing: '0.3px',
            }}>
              {filled}/{frames.length}
            </span>
          )}
        </div>

        {/* Auth */}
        {!authLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {user ? (
              <>
                <span style={{
                  fontSize: '12px', color: '#7A6550', fontWeight: '500',
                  maxWidth: '100px', overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {user.username}
                </span>
                <SignOutButton />
              </>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  background: '#2C1810',
                  color: '#F5F1EA',
                  fontSize: '12px',
                  fontWeight: '600',
                  fontFamily: 'inherit',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Sign In
              </button>
            )}
          </div>
        )}
      </header>

      {/* ── Wall area ── */}
      <main style={{ flex: 1, padding: '8px 8px 80px 8px', boxSizing: 'border-box', minHeight: 0 }}>

        {/* Loading skeleton */}
        {isLoading && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, 80px)',
            gap: '4px',
            width: '100%',
          }}>
            {Array.from({ length: 60 }).map((_, i) => (
              <div key={i} style={{
                width: '80px',
                height: '80px',
                borderRadius: '2px',
                background: 'linear-gradient(145deg, #D8CEBC, #CCC2B0)',
                animation: 'skPulse 1.3s ease-in-out infinite',
                animationDelay: `${(i % 20) * 0.03}s`,
              }} />
            ))}
            <style>{`
              @keyframes skPulse {
                0%,100% { opacity: 0.85; }
                50%      { opacity: 0.4; }
              }
            `}</style>
          </div>
        )}

        {/* Error */}
        {wallError && !isLoading && (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            height: '60vh', gap: '16px', textAlign: 'center', padding: '24px',
          }}>
            <p style={{ fontSize: '13px', color: '#C0392B', fontWeight: '500' }}>
              Connection Error
            </p>
            <p style={{ fontSize: '12px', color: '#9A8570', maxWidth: '320px' }}>
              {wallError}
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={loadFrames}
              style={{
                padding: '9px 22px', borderRadius: '8px',
                background: '#2C1810', color: '#F5F1EA',
                border: 'none', fontSize: '13px', fontWeight: '600',
                fontFamily: 'inherit', cursor: 'pointer',
              }}
            >
              Retry
            </motion.button>
          </div>
        )}

        {/* The wall */}
        {!isLoading && !wallError && (
          <PhotoWall frames={frames} onFrameClick={handleFrameClick} />
        )}
      </main>

      {/* Modals */}
      {showAuth && (
        <AuthModal
          onClose={() => { setShowAuth(false); setPendingFrame(null) }}
          onSuccess={handleAuthSuccess}
        />
      )}
      {activeFrame && (
        <FrameModal
          frame={activeFrame}
          onClose={() => setActiveFrame(null)}
          onUpdated={handleFrameUpdated}
        />
      )}
    </div>
  )
}

/** Inline sign-out button — reads auth from context without prop drilling */
function SignOutButton() {
  const { logout } = useAuth()
  return (
    <button
      onClick={logout}
      style={{
        padding: '6px 12px',
        borderRadius: '6px',
        border: '1px solid rgba(92,74,50,0.25)',
        background: 'transparent',
        color: '#5C4A32',
        fontSize: '12px',
        fontWeight: '600',
        fontFamily: 'inherit',
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(92,74,50,0.07)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      Sign Out
    </button>
  )
}
