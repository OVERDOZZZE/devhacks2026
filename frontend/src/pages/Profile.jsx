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
    const hasFiles = avatarFile || resumeFile || removeAvatar
    if (hasFiles) {
      const formData = new FormData()
      formData.append('name', form.name ?? '')
      formData.append('surname', form.surname ?? '')
      if (avatarFile) formData.append('avatar', avatarFile)
      else if (removeAvatar) formData.append('avatar', '')
      if (resumeFile) formData.append('resume', resumeFile)
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
        })
        .catch(() => setError('Failed to save profile.'))
        .finally(() => setSaving(false))
    } else {
      client.patch('/auth/me/', form)
        .then(res => setProfile(res.data))
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
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex' }}>
      {/* Sidebar - same as Dashboard */}
      <aside style={{
        width: sidebarWidth,
        minHeight: '100vh',
        background: '#fff',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #e5e7eb' }}>
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
        <div style={{ padding: '16px 12px', borderTop: '1px solid #e5e7eb' }}>
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
      <main style={{ flex: 1, padding: '48px 48px 64px', overflow: 'auto', fontFamily: bodyFont, maxWidth: 640 }}>
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
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, marginBottom: 40 }}>
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
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

        {/* Resume */}
        <div style={{ marginBottom: 32 }}>
          <label style={{ display: 'block', fontSize: 14, color: '#6b7280', marginBottom: 8, fontWeight: 500 }}>Resume</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <input
              ref={resumeInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              onClick={() => resumeInputRef.current?.click()}
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
              Upload resume
            </button>
            {(resumeFile?.name || profile?.resume) && (
              <span style={{ fontSize: 14, color: '#6b7280' }}>
                {resumeFile ? resumeFile.name : 'Current file attached'}
              </span>
            )}
          </div>
        </div>

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
