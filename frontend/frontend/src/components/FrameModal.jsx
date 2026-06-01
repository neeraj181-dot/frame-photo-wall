import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

/**
 * FrameModal
 * Ownership-aware frame interaction modal.
 *
 * Cases:
 *  A) Empty frame          → upload zone (any logged-in user)
 *  B) Filled, I own it     → full image + Replace + Delete + Download
 *  C) Filled, someone else → full image + Download only + "uploaded by X" notice
 */
export default function FrameModal({ frame, onClose, onUpdated }) {
  const { user } = useAuth()

  const [dragging,  setDragging]  = useState(false)
  const [preview,   setPreview]   = useState(null)
  const [file,      setFile]      = useState(null)
  const [uploading, setUploading] = useState(false)
  const [deleting,  setDeleting]  = useState(false)
  const [error,     setError]     = useState('')
  const fileRef = useRef(null)

  const hasImage = !!frame.image_url
  // Ownership: true if this frame has no owner yet, or the owner is the current user
  const isOwner  = !frame.uploaded_by || (user && frame.uploaded_by.id === user.id)
  // Can edit = logged in AND (frame is empty OR user owns it)
  const canEdit  = user && (!hasImage || isOwner)

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

  const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

  const processFile = (f) => {
    if (!f) return
    if (!ALLOWED.includes(f.type)) { setError('Use JPG, PNG, WEBP, or GIF.'); return }
    if (f.size > 10 * 1024 * 1024) { setError('File must be under 10 MB.'); return }
    setError('')
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    processFile(e.dataTransfer.files[0])
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setError('')
    const fd = new FormData()
    fd.append('image', file)
    // Use /upload/ for new photos, /replace/ for replacing owned photos
    const endpoint = hasImage
      ? `/frames/${frame.id}/replace/`
      : `/frames/${frame.id}/upload/`
    const method = hasImage ? 'patch' : 'post'
    try {
      const { data } = await api[method](endpoint, fd)
      onUpdated(data)
      onClose()
    } catch (err) {
      const msg = err.response?.data?.error
             || err.response?.data?.detail
             || 'Upload failed. Please try again.'
      setError(msg)
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Remove this photo from the frame?')) return
    setDeleting(true)
    setError('')
    try {
      const { data } = await api.delete(`/frames/${frame.id}/delete/`)
      onUpdated(data)
      onClose()
    } catch (err) {
      const msg = err.response?.data?.error
             || err.response?.data?.detail
             || 'Delete failed.'
      setError(msg)
      setDeleting(false)
    }
  }

  const handleDownload = () => {
    const a = document.createElement('a')
    a.href     = frame.image_url
    a.download = `frame-${frame.slot_number}.jpg`
    a.target   = '_blank'
    a.click()
  }

  const cancelPreview = () => {
    setFile(null)
    setPreview(null)
    setError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  /* ── Shared styles ── */
  const S = {
    btnPrimary: {
      flex: 1,
      padding: '11px 18px',
      borderRadius: '9px',
      border: 'none',
      background: '#2C1810',
      color: '#F5F1EA',
      fontSize: '13px',
      fontWeight: '600',
      fontFamily: 'inherit',
      cursor: 'pointer',
    },
    btnSecondary: {
      padding: '11px 14px',
      borderRadius: '9px',
      border: '1.5px solid rgba(139,115,85,0.25)',
      background: 'transparent',
      color: '#5C4A32',
      fontSize: '13px',
      fontWeight: '500',
      fontFamily: 'inherit',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
    },
    btnDanger: {
      padding: '11px 14px',
      borderRadius: '9px',
      border: '1.5px solid rgba(224,85,85,0.3)',
      background: 'transparent',
      color: '#C0392B',
      fontSize: '13px',
      fontWeight: '500',
      fontFamily: 'inherit',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
    },
  }

  return (
    <AnimatePresence>
      <motion.div
        key="bd"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 60,
          background: 'rgba(15,8,4,0.7)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px',
        }}
      >
        <motion.div
          key="card"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0,  scale: 1    }}
          exit={{    opacity: 0, y: 12, scale: 0.97  }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: hasImage && !preview ? '600px' : '460px',
            background: 'rgba(251, 248, 243, 0.97)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '18px',
            border: '1px solid rgba(139,115,85,0.14)',
            boxShadow: '0 28px 70px rgba(0,0,0,0.28), 0 6px 20px rgba(0,0,0,0.1)',
            overflow: 'hidden',
          }}
        >
          {/* ── Title bar ── */}
          <div style={{
            padding: '18px 22px 14px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(139,115,85,0.09)',
          }}>
            <div>
              <h2 style={{
                fontSize: '16px', fontWeight: '700',
                color: '#1a1a1a', letterSpacing: '-0.3px', margin: 0,
              }}>
                Frame {frame.slot_number}
              </h2>
              {frame.uploaded_by && (
                <p style={{ fontSize: '11px', color: '#9A8570', marginTop: '3px' }}>
                  Uploaded by <strong style={{ color: '#5C4A32' }}>{frame.uploaded_by.username}</strong>
                  {frame.uploaded_at && ` · ${new Date(frame.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                width: '30px', height: '30px', borderRadius: '50%',
                border: '1px solid rgba(139,115,85,0.18)',
                background: 'rgba(139,115,85,0.06)',
                color: '#9A8570', fontSize: '13px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', flexShrink: 0, marginTop: '1px',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,115,85,0.14)'; e.currentTarget.style.color = '#2C1810' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(139,115,85,0.06)'; e.currentTarget.style.color = '#9A8570' }}
            >✕</button>
          </div>

          {/* ── Body ── */}
          <div style={{ padding: '20px 22px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* ── CASE A: Empty frame — upload zone ── */}
            {!hasImage && (
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                style={{
                  minHeight: '180px',
                  borderRadius: '10px',
                  border: `2px dashed ${dragging ? '#8B6540' : 'rgba(139,115,85,0.28)'}`,
                  background: dragging ? 'rgba(139,101,64,0.04)' : 'rgba(139,115,85,0.02)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: '10px', cursor: 'pointer',
                  transition: 'all 0.18s',
                  overflow: 'hidden',
                  padding: preview ? '0' : '28px',
                }}
              >
                {preview ? (
                  <img src={preview} alt="Preview"
                    style={{ width: '100%', maxHeight: '320px', objectFit: 'contain', display: 'block' }} />
                ) : (
                  <>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '50%',
                      background: 'rgba(139,115,85,0.09)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                        stroke="#8B6540" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: '#4A3728' }}>
                        Drop a photo here
                      </p>
                      <p style={{ fontSize: '11px', color: '#9A8570', marginTop: '3px' }}>
                        or click to browse · JPG PNG WEBP GIF · max 10 MB
                      </p>
                    </div>
                  </>
                )}
                <input ref={fileRef} type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  style={{ display: 'none' }}
                  onChange={(e) => processFile(e.target.files[0])} />
              </div>
            )}

            {/* ── CASE B/C: Filled frame — show image ── */}
            {hasImage && !preview && (
              <div style={{
                borderRadius: '10px', overflow: 'hidden',
                background: '#111', maxHeight: '400px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <img src={frame.image_url} alt={`Frame ${frame.slot_number}`}
                  style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', display: 'block' }} />
              </div>
            )}

            {/* Replace preview */}
            {hasImage && preview && (
              <div style={{
                borderRadius: '10px', overflow: 'hidden',
                background: '#111', maxHeight: '360px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <img src={preview} alt="New photo preview"
                  style={{ width: '100%', maxHeight: '360px', objectFit: 'contain', display: 'block' }} />
              </div>
            )}

            {/* ── CASE C: Not owner notice ── */}
            {hasImage && !isOwner && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(139,115,85,0.07)',
                border: '1px solid rgba(139,115,85,0.15)',
                fontSize: '12px',
                color: '#7A6550',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="#9A8570" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                This photo was uploaded by <strong style={{ color: '#5C4A32' }}>{frame.uploaded_by?.username}</strong>.
                Only they can replace or delete it.
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{
                padding: '9px 13px', borderRadius: '7px',
                background: 'rgba(224,85,85,0.07)',
                border: '1px solid rgba(224,85,85,0.2)',
                fontSize: '12px', color: '#C0392B',
              }}>
                {error}
              </div>
            )}

            {/* ── Action buttons ── */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>

              {/* Uploading new photo to empty frame — confirm */}
              {!hasImage && preview && (
                <>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleUpload} disabled={uploading}
                    style={{ ...S.btnPrimary, opacity: uploading ? 0.6 : 1 }}>
                    {uploading ? 'Uploading…' : 'Upload Photo'}
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={cancelPreview} style={S.btnSecondary}>
                    Cancel
                  </motion.button>
                </>
              )}

              {/* Empty frame, no preview yet */}
              {!hasImage && !preview && (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => fileRef.current?.click()} style={S.btnPrimary}>
                  Choose Photo
                </motion.button>
              )}

              {/* Filled frame — owner actions */}
              {hasImage && isOwner && !preview && (
                <>
                  {/* Replace — triggers file picker, then shows preview */}
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => fileRef.current?.click()} style={S.btnSecondary}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    Replace
                    <input ref={fileRef} type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      style={{ display: 'none' }}
                      onChange={(e) => processFile(e.target.files[0])} />
                  </motion.button>

                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleDownload} style={S.btnSecondary}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Download
                  </motion.button>

                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleDelete} disabled={deleting}
                    style={{ ...S.btnDanger, opacity: deleting ? 0.6 : 1 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
                    </svg>
                    {deleting ? 'Removing…' : 'Delete'}
                  </motion.button>
                </>
              )}

              {/* Filled frame — owner confirming replace */}
              {hasImage && isOwner && preview && (
                <>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleUpload} disabled={uploading}
                    style={{ ...S.btnPrimary, opacity: uploading ? 0.6 : 1 }}>
                    {uploading ? 'Replacing…' : 'Confirm Replace'}
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={cancelPreview} style={S.btnSecondary}>
                    Cancel
                  </motion.button>
                </>
              )}

              {/* Filled frame — not owner: download only */}
              {hasImage && !isOwner && (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleDownload} style={S.btnSecondary}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Download
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
