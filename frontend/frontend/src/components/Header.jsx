import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

/**
 * Header — fixed glassmorphism bar, 70px tall.
 * Logo left · Title center · Auth right
 */
export default function Header({ onSignInClick }) {
  const { user, logout, loading } = useAuth()

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 50,
        height: '70px',
        background: 'rgba(245, 241, 234, 0.82)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(139,115,85,0.12)',
        boxShadow: '0 2px 24px rgba(0,0,0,0.06)',
      }}
    >
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 24px',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div style={{
            width: '34px', height: '34px',
            border: '3px solid #5C4A32',
            borderRadius: '4px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
            boxShadow: '2px 2px 0 #3a2e1e',
          }}>
            <div style={{
              width: '14px', height: '14px',
              background: '#5C4A32',
              borderRadius: '2px',
            }} />
          </div>
          <span style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#2C1810',
            letterSpacing: '-0.5px',
          }}>Frame</span>
        </div>

        {/* Center title — hidden on small screens */}
        <div style={{ flex: 1, textAlign: 'center' }} className="hidden sm:block">
          <h1 style={{
            fontSize: '15px',
            fontWeight: '600',
            color: '#4A3728',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
          }}>
            Community Photo Wall
          </h1>
        </div>

        {/* Auth */}
        {!loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            {user ? (
              <>
                <span style={{
                  fontSize: '13px',
                  color: '#7A6550',
                  fontWeight: '500',
                  maxWidth: '120px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }} className="hidden sm:block">
                  {user.username}
                </span>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={logout}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    border: '1.5px solid rgba(92,74,50,0.3)',
                    background: 'transparent',
                    color: '#5C4A32',
                    fontSize: '13px',
                    fontWeight: '600',
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(92,74,50,0.08)'
                    e.currentTarget.style.borderColor = 'rgba(92,74,50,0.5)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.borderColor = 'rgba(92,74,50,0.3)'
                  }}
                >
                  Sign Out
                </motion.button>
              </>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onSignInClick}
                style={{
                  padding: '9px 22px',
                  borderRadius: '8px',
                  background: '#2C1810',
                  color: '#F5F1EA',
                  fontSize: '13px',
                  fontWeight: '600',
                  fontFamily: 'inherit',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(44,24,16,0.25)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#3d2418'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(44,24,16,0.35)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#2C1810'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(44,24,16,0.25)'
                }}
              >
                Sign In
              </motion.button>
            )}
          </div>
        )}
      </div>
    </motion.header>
  )
}
