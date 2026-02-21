import { useEffect, useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import client from '../api/client'

const sidebarWidth = 220
const bodyFont = "'Inter', sans-serif"
const titleFont = "'Georgia', 'Times New Roman', serif"
const primaryColor = '#000'

export default function Profile() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const resumeInputRef = useRef(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', surname: '' })
  const [avatarFile, setAvatarFile] = useState(null)
  const [resumeFile, setResumeFile] = useState(null)
  const [removeAvatar, setRemoveAvatar] = useState(false)
  const [removeResume, setRemoveResume] = useState(false)
  const [savedMessage, setSavedMessage] = useState(false)
  const [resumeDropActive, setResumeDropActive] = useState(false)
  const [resumeError, setResumeError] = useState('')

  const RESUME_MAX_BYTES = 5 * 1024 * 1024 // 5MB
  const RESUME_ACCEPT = '.pdf,.doc,.docx'
  const acceptedResume = (file) => {
    if (!file) return false
    const name = (file.name || '').toLowerCase()
    return name.endsWith('.pdf') || name.endsWith('.doc') || name.endsWith('.docx')
  }
  const formatFileSize = (bytes) => {
    if (bytes == null || bytes === 0) return '—'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
  const setResumeFromFile = (file) => {
    setResumeError('')
    setRemoveResume(false)
    if (!file) {
      setResumeFile(null)
      return
    }
    if (!acceptedResume(file)) {
      setResumeError('Please use PDF or DOCX.')
      return
    }
    if (file.size > RESUME_MAX_BYTES) {
      setResumeError('File must be 5MB or smaller.')
      return
    }
    setResumeFile(file)
  }
  const handleResumeRemove = () => {
    setResumeFile(null)
    setResumeError('')
    if (profile?.resume) setRemoveResume(true)
    if (resumeInputRef.current) resumeInputRef.current.value = ''
  }
  const hasResume = (resumeFile || (profile?.resume && !removeResume))
  const resumeDisplayName = resumeFile ? resumeFile.name : (profile?.resume && !removeResume ? (typeof profile.resume === 'string' && profile.resume.includes('/') ? profile.resume.split('/').pop() : 'Current file') : null)
  const resumeDisplaySize = resumeFile ? formatFileSize(resumeFile.size) : (profile?.resume && !removeResume ? null : null)

  useEffect(() => {
    client.get('/auth/me/')
      .then(res => {
        const u = res.data
        setProfile(u)
        setForm({ name: u?.name ?? '', surname: u?.surname ?? '' })
      })
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false))
  }, [navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0] ?? null
    setAvatarFile(file)
    setRemoveAvatar(false)
  }

  const handleDeletePicture = () => {
    setAvatarFile(null)
    setRemoveAvatar(true)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSave = () => {
    setSaving(true)
    setError('')
    const hasFiles = avatarFile || resumeFile || removeAvatar || removeResume
    if (hasFiles) {
      const formData = new FormData()
      formData.append('name', form.name ?? '')
      formData.append('surname', form.surname ?? '')
      if (avatarFile) formData.append('avatar', avatarFile)
      else if (removeAvatar) formData.append('avatar', '')
      if (resumeFile) formData.append('resume', resumeFile)
      else if (removeResume) formData.append('resume', '')
      const token = localStorage.getItem('token')
      fetch(`${client.defaults.baseURL}/auth/me/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Token ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
        body: formData,
      })
        .then(res => res.ok ? res.json() : Promise.reject(new Error('Failed to update profile')))
        .then(data => {
          setProfile(data)
          setAvatarFile(null)
          setResumeFile(null)
          setRemoveAvatar(false)
          setRemoveResume(false)
          setSavedMessage(true)
          setError('')
          setTimeout(() => setSavedMessage(false), 4000)
        })
        .catch(() => setError('Failed to save profile.'))
        .finally(() => setSaving(false))
    } else {
      client.patch('/auth/me/', form)
        .then(res => {
          setProfile(res.data)
          setSavedMessage(true)
          setError('')
          setTimeout(() => setSavedMessage(false), 4000)
        })
        .catch(() => setError('Failed to save profile.'))
        .finally(() => setSaving(false))
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const avatarPreview = avatarFile
    ? URL.createObjectURL(avatarFile)
    : removeAvatar
      ? null
      : profile?.avatar

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: bodyFont, color: '#6b7280', fontSize: 15 }}>Loading...</p>
      </div>
    )
  }

  return (
    <div className="profile-layout" style={{ minHeight: '100vh', background: '#fff', display: 'flex' }}>
      <style>{`
        @media (max-width: 900px) {
          .profile-layout { flex-direction: column; }
          .profile-sidebar { width: 100% !important; min-height: auto !important; flex-direction: row !important; flex-wrap: wrap !important; border-right: none !important; border-bottom: 1px solid #e5e7eb !important; }
          .profile-sidebar nav { flex-direction: row !important; flex-wrap: wrap !important; gap: 8 !important; padding: 12px !important; }
          .profile-sidebar .profile-logout-wrap { width: auto !important; border-top: none !important; border-left: 1px solid #e5e7eb !important; }
        }
        @media (max-width: 600px) {
          .profile-main { padding: 24px 20px 48px !important; max-width: 100% !important; }
          .profile-form-grid { grid-template-columns: 1fr !important; }
          .profile-avatar-row { flex-direction: column !important; align-items: flex-start !important; }
        }
      `}</style>
      {/* Sidebar - same as Dashboard */}
      <aside className="profile-sidebar" style={{
        width: sidebarWidth,
        minHeight: '100vh',
        background: '#fff',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}>
        <Link to="/dashboard" style={{ textDecoration: 'none' }}>
          <div style={{ padding: '24px 20px', borderBottom: '1px solid #e5e7eb', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36,
                height: 36,
                background: '#1a1a1a',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </div>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 16, color: '#1a1a1a' }}>
                Dashboard
              </span>
            </div>
          </div>
        </Link>
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          <Link
            to="/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 12px',
              borderRadius: 8,
              background: 'transparent',
              color: '#1a1a1a',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 500,
              fontFamily: bodyFont,
              marginBottom: 4,
            }}
          >
            Interviews
          </Link>
          <Link
            to="/profile"
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 12px',
              borderRadius: 8,
              background: '#f3f4f6',
              color: '#1a1a1a',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 500,
              fontFamily: bodyFont,
            }}
          >
            Profile
          </Link>
        </nav>
        <div className="profile-logout-wrap" style={{ padding: '16px 12px', borderTop: '1px solid #e5e7eb' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '10px 20px',
              borderRadius: 8,
              border: 'none',
              background: '#000',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content - Public profile */}
      <main className="profile-main" style={{ flex: 1, padding: '48px 48px 64px', overflow: 'auto', fontFamily: bodyFont, maxWidth: 640 }}>
        <h1 style={{
          fontFamily: titleFont,
          fontSize: 28,
          fontWeight: 700,
          color: '#1f2937',
          margin: '0 0 32px',
        }}>
          Public profile
        </h1>

        {/* Profile picture + Change / Delete */}
        <div className="profile-avatar-row" style={{ display: 'flex', alignItems: 'flex-start', gap: 24, marginBottom: 40 }}>
          <div style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            overflow: 'hidden',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            background: '#f9fafb',
            flexShrink: 0,
          }}>
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9ca3af',
                fontSize: 14,
              }}>
                No photo
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            style={{ display: 'none' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                border: 'none',
                background: primaryColor,
                color: '#fff',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: bodyFont,
              }}
            >
              Change picture
            </button>
            <button
              type="button"
              onClick={handleDeletePicture}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                border: 'none',
                background: '#000',
                color: '#fff',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: bodyFont,
              }}
            >
              Delete picture
            </button>
          </div>
        </div>

        {/* First name / Last name - two columns */}
        <div className="profile-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          <div>
            <label style={{ display: 'block', fontSize: 14, color: '#6b7280', marginBottom: 8, fontWeight: 500 }}>First name</label>
            <input
              type="text"
              name="name"
              value={form.name ?? ''}
              onChange={handleChange}
              placeholder="First name"
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                fontSize: 14,
                color: '#1f2937',
                boxSizing: 'border-box',
                fontFamily: bodyFont,
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, color: '#6b7280', marginBottom: 8, fontWeight: 500 }}>Last name</label>
            <input
              type="text"
              name="surname"
              value={form.surname ?? ''}
              onChange={handleChange}
              placeholder="Last name"
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                fontSize: 14,
                color: '#1f2937',
                boxSizing: 'border-box',
                fontFamily: bodyFont,
              }}
            />
          </div>
        </div>

        {/* Resume / CV */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{
            fontFamily: bodyFont,
            fontSize: 16,
            fontWeight: 600,
            color: '#1f2937',
            margin: '0 0 12px',
          }}>
            Resume / CV
          </h2>
          <input
            ref={resumeInputRef}
            type="file"
            accept={RESUME_ACCEPT}
            onChange={(e) => setResumeFromFile(e.target.files?.[0] ?? null)}
            style={{ display: 'none' }}
          />
          <div
            onClick={() => resumeInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setResumeDropActive(true); }}
            onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setResumeDropActive(false); }}
            onDrop={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setResumeDropActive(false)
              const file = e.dataTransfer?.files?.[0]
              setResumeFromFile(file ?? null)
            }}
            style={{
              border: `2px dashed ${resumeDropActive ? '#1a1a1a' : '#e5e7eb'}`,
              borderRadius: 8,
              background: resumeDropActive ? '#f9fafb' : '#fafafa',
              padding: '32px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'border-color 0.15s, background 0.15s',
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px', display: 'block' }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1f2937', marginBottom: 4 }}>Drop your CV here</div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>PDF, DOCX · up to 5MB</div>
          </div>
          {resumeError && <p style={{ color: '#dc2626', fontSize: 13, marginTop: 8 }}>{resumeError}</p>}
          {hasResume && resumeDisplayName && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              marginTop: 12,
              padding: '10px 12px',
              background: '#f9fafb',
              borderRadius: 6,
              border: '1px solid #e5e7eb',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <span style={{ color: '#1f2937', fontSize: 16, lineHeight: 1 }}>•</span>
                <span style={{ fontSize: 14, color: '#1f2937', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{resumeDisplayName}</span>
                {resumeDisplaySize != null && (
                  <span style={{ fontSize: 13, color: '#6b7280', flexShrink: 0 }}>{resumeDisplaySize.toLowerCase()}</span>
                )}
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleResumeRemove(); }}
                style={{
                  width: 28,
                  height: 28,
                  flexShrink: 0,
                  borderRadius: 6,
                  border: '1px solid #e5e7eb',
                  background: '#fff',
                  color: '#374151',
                  fontSize: 16,
                  lineHeight: 1,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Remove resume"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {savedMessage && (
          <div style={{
            marginBottom: 20,
            padding: '12px 16px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: 8,
            color: '#059669',
            fontSize: 14,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Profile saved
          </div>
        )}
        {error && <p style={{ color: '#dc2626', fontSize: 14, marginBottom: 16 }}>{error}</p>}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '12px 28px',
            borderRadius: 8,
            border: 'none',
            background: primaryColor,
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
            fontFamily: bodyFont,
          }}
        >
          {saving ? 'Saving...' : 'Save profile'}
        </button>
      </main>
    </div>
  )
}
