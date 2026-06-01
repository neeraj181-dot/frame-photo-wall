import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

/**
 * AuthModal — premium glassmorphism login + register modal.
 * Width: 500px desktop, 95vw mobile.
 * Tabs: Sign In | Register
 * On success → calls onSuccess() so parent can open the pending frame.
 */
export default function AuthModal({ onClose, onSuccess }) {
  const { login } = useAuth()
  const [tab, setTab]         = useState('login')
  const [form, setForm]       = useState({ username: '', password: '', password2: '' })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const firstInputRef         = useRef(null)

  /* Close on Escape */
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  /* Lock body scroll */
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  /* Focus first input when tab changes */
  useEffect(() => {
    setTimeout(() => firstInputRef.current?.focus(), 80)
  }, [tab])

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    setErrors(er => ({ ...er, [field]: '', general: '' }))
  }

  const switchTab = (t) => {
    setTab(t)
    setForm({ username: '', password: '', password2: '' })
    setErrors({})
  }

  /* ── Login ── */
  const handleLogin = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.username.trim()) errs.username = 'Username is required.'
    if (!form.password)        errs.password = 'Password is required.'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      await login(form.username.trim(), form.password)
      onSuccess()
    } catch (err) {
      setErrors({ general: err.response?.data?.detail || 'Invalid username or password.' })
    } finally {
      setLoading(false)
    }
  }

  /* ── Register ── */
  const handleRegister = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.username.trim())          errs.username  = 'Username is required.'
    if (!form.password)                 errs.password  = 'Password is required.'
    else if (form.password.length < 6)  errs.password  = 'At least 6 characters.'
    if (form.password !== form.password2) errs.password2 = 'Passwords do not match.'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      await api.post('/auth/register/', {
        username:  form.username.trim(),
        password:  form.password,
        password2: form.password2,
      })
      await login(form.username.trim(), form.password)
      onSuccess()
    } catch (err) {
      const data = err.response?.data || {}
      setErrors({
        username:  data.username?.[0],
        password:  data.password?.[0],
        password2: data.password2?.[0],
        general:   data.non_field_errors?.[0] || (!data.username && !data.password ? 'Registration failed.' : ''),
      })
    } finally {
      setLoading(false)
    }
  }

  /* ── Shared input style ── */
  const inputStyle = (hasErr) => ({
    width: '100%',
    padding: '13px 16px',
    borderRadius: '10px',
    border: `1.5px solid ${hasErr ? '#E05555' : 'rgba(139,115,85,0.2)'}`,
    background: 'rgba(255,255,255,0.7)',
    color: '#1a1a1a',
    fontSize: '14px',
    fontFamily: 'inherit',
    fontWeight: '400',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
    boxSizing: 'border-box',
  })

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 60,
          background: 'rgba(20,12,6,0.6)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }}
      >
        {/* Card */}
        <motion.div
          key="card"
          initial={{ opacity: 0, y: 32, scale: 0.95 }}
          animate={{ opacity: 1, y: 0,  scale: 1    }}
          exit={{    opacity: 0, y: 16, scale: 0.97  }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '500px',
            background: 'rgba(252, 249, 244, 0.92)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius: '20px',
            border: '1px solid rgba(139,115,85,0.15)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.12)',
            overflow: 'hidden',
          }}
        >
          {/* ── Top bar ── */}
          <div style={{
            padding: '28px 32px 0',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}>
            <div>
              {/* Frame logo mini */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <div style={{
                  width: '26px', height: '26px',
                  border: '2.5px solid #5C4A32',
                  borderRadius: '3px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '1.5px 1.5px 0 #3a2e1e',
                }}>
                  <div style={{ width: '10px', height: '10px', background: '#5C4A32', borderRadius: '1px' }} />
                </div>
                <span style={{ fontSize: '15px', fontWeight: '700', color: '#2C1810', letterSpacing: '-0.3px' }}>
                  Frame
                </span>
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1a1a1a', letterSpacing: '-0.4px', lineHeight: 1.2 }}>
                {tab === 'login' ? 'Welcome back' : 'Create account'}
              </h2>
              <p style={{ fontSize: '13px', color: '#9A8570', marginTop: '6px', fontWeight: '400' }}>
                {tab === 'login'
                  ? 'Sign in to upload and manage photos on the wall.'
                  : 'Join the community and start adding photos.'}
              </p>
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                width: '32px', height: '32px',
                borderRadius: '50%',
                border: '1px solid rgba(139,115,85,0.2)',
                background: 'rgba(139,115,85,0.06)',
                color: '#9A8570',
                fontSize: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                marginTop: '2px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,115,85,0.14)'; e.currentTarget.style.color = '#2C1810' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(139,115,85,0.06)'; e.currentTarget.style.color = '#9A8570' }}
            >✕</button>
          </div>

          {/* ── Tabs ── */}
          <div style={{
            display: 'flex',
            margin: '24px 32px 0',
            background: 'rgba(139,115,85,0.08)',
            borderRadius: '10px',
            padding: '4px',
            gap: '4px',
          }}>
            {[['login', 'Sign In'], ['register', 'Register']].map(([t, label]) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                style={{
                  flex: 1,
                  padding: '9px',
                  borderRadius: '7px',
                  border: 'none',
                  background: tab === t ? '#fff' : 'transparent',
                  color: tab === t ? '#2C1810' : '#9A8570',
                  fontSize: '13px',
                  fontWeight: tab === t ? '600' : '500',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ── Form ── */}
          <form
            onSubmit={tab === 'login' ? handleLogin : handleRegister}
            style={{ padding: '24px 32px 32px', display: 'flex', flexDirection: 'column', gap: '16px' }}
            noValidate
          >
            {/* Username */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#7A6550', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Username
              </label>
              <input
                ref={firstInputRef}
                type="text"
                value={form.username}
                onChange={set('username')}
                placeholder="your_username"
                autoComplete="username"
                style={inputStyle(!!errors.username)}
                onFocus={e => { e.target.style.borderColor = '#8B6540'; e.target.style.boxShadow = '0 0 0 3px rgba(139,101,64,0.12)'; e.target.style.background = '#fff' }}
                onBlur={e  => { e.target.style.borderColor = errors.username ? '#E05555' : 'rgba(139,115,85,0.2)'; e.target.style.boxShadow = 'none'; e.target.style.background = 'rgba(255,255,255,0.7)' }}
              />
              {errors.username && <span style={{ fontSize: '12px', color: '#E05555' }}>{errors.username}</span>}
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#7A6550', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={set('password')}
                placeholder="••••••••"
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                style={inputStyle(!!errors.password)}
                onFocus={e => { e.target.style.borderColor = '#8B6540'; e.target.style.boxShadow = '0 0 0 3px rgba(139,101,64,0.12)'; e.target.style.background = '#fff' }}
                onBlur={e  => { e.target.style.borderColor = errors.password ? '#E05555' : 'rgba(139,115,85,0.2)'; e.target.style.boxShadow = 'none'; e.target.style.background = 'rgba(255,255,255,0.7)' }}
              />
              {errors.password && <span style={{ fontSize: '12px', color: '#E05555' }}>{errors.password}</span>}
            </div>

            {/* Confirm password (register only) */}
            <AnimatePresence>
              {tab === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflow: 'hidden' }}
                >
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#7A6550', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={form.password2}
                    onChange={set('password2')}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    style={inputStyle(!!errors.password2)}
                    onFocus={e => { e.target.style.borderColor = '#8B6540'; e.target.style.boxShadow = '0 0 0 3px rgba(139,101,64,0.12)'; e.target.style.background = '#fff' }}
                    onBlur={e  => { e.target.style.borderColor = errors.password2 ? '#E05555' : 'rgba(139,115,85,0.2)'; e.target.style.boxShadow = 'none'; e.target.style.background = 'rgba(255,255,255,0.7)' }}
                  />
                  {errors.password2 && <span style={{ fontSize: '12px', color: '#E05555' }}>{errors.password2}</span>}
                </motion.div>
              )}
            </AnimatePresence>

            {/* General error */}
            <AnimatePresence>
              {errors.general && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    padding: '11px 14px',
                    borderRadius: '8px',
                    background: 'rgba(224,85,85,0.08)',
                    border: '1px solid rgba(224,85,85,0.2)',
                    fontSize: '13px',
                    color: '#C0392B',
                    fontWeight: '500',
                  }}
                >
                  {errors.general}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.01 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '10px',
                border: 'none',
                background: loading ? '#9A8570' : '#2C1810',
                color: '#F5F1EA',
                fontSize: '14px',
                fontWeight: '600',
                fontFamily: 'inherit',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(44,24,16,0.3)',
                transition: 'background 0.2s, box-shadow 0.2s',
                marginTop: '4px',
                letterSpacing: '0.2px',
              }}
            >
              {loading
                ? (tab === 'login' ? 'Signing in…' : 'Creating account…')
                : (tab === 'login' ? 'Sign In' : 'Create Account')}
            </motion.button>

            {/* Switch tab hint */}
            <p style={{ textAlign: 'center', fontSize: '13px', color: '#9A8570', marginTop: '4px' }}>
              {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={() => switchTab(tab === 'login' ? 'register' : 'login')}
                style={{
                  background: 'none', border: 'none',
                  color: '#5C4A32', fontWeight: '600',
                  fontSize: '13px', fontFamily: 'inherit',
                  cursor: 'pointer', textDecoration: 'underline',
                  textUnderlineOffset: '2px',
                }}
              >
                {tab === 'login' ? 'Register' : 'Sign In'}
              </button>
            </p>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
