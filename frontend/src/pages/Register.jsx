import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import client from '../api/client'
import WelcomePanel from '../components/WelcomePanel'

const inputStyle = {
  width: '100%',
  border: 'none',
  borderBottom: '1px solid #e5e7eb',
  padding: '10px 0',
  marginBottom: 16,
  outline: 'none',
  fontSize: 16,
  backgroundColor: 'transparent',
}

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', name: '', surname: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await client.post('/auth/register/', form)
      localStorage.setItem('token', res.data.token)
      if (rememberMe) {
        localStorage.setItem('rememberEmail', form.email)
      } else {
        localStorage.removeItem('rememberEmail')
      }
      navigate('/dashboard')
    } catch (err) {
      setError('Registration failed. Email may already be in use.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f9fafb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        display: 'flex',
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
        maxWidth: 900,
        width: '100%',
        overflow: 'hidden',
      }}>
        <div style={{
          flex: 1,
          minWidth: 320,
          padding: '32px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
        <h1 style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 28,
          fontWeight: 700,
          color: '#1a1a1a',
          textAlign: 'center',
          margin: '0 0 4px',
        }}>
          Sign up
        </h1>
        <p style={{
          fontSize: 14,
          color: '#6b7280',
          textAlign: 'center',
          margin: '0 0 24px',
        }}>
          Sign up to continue
        </p>

        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            style={inputStyle}
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            style={inputStyle}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            style={{ ...inputStyle, marginBottom: 24 }}
          />

          {error && (
            <p style={{ color: '#dc2626', fontSize: 14, marginBottom: 16 }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: '#000',
              color: '#fff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 16,
            cursor: 'pointer',
          }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ accentColor: '#2563eb', width: 18, height: 18, cursor: 'pointer' }}
            />
            <span style={{ fontSize: 14, color: '#1a1a1a' }}>Remember me</span>
          </label>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: 24,
          marginBottom: 0,
          fontSize: 14,
          color: '#1a1a1a',
        }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#2563eb', textDecoration: 'underline' }}>
            Sign in
          </Link>
        </p>
        </div>
        <WelcomePanel
          title="Join us!"
          subtitle="Create an account to get started."
        />
      </div>
    </div>
  )
}
