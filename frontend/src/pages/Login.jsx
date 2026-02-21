import { useState, useEffect } from 'react'
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

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberEmail')
    if (savedEmail) setForm((f) => ({ ...f, email: savedEmail }))
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await client.post('/auth/login/', form)
      localStorage.setItem('token', res.data.token)
      if (rememberMe) {
        localStorage.setItem('rememberEmail', form.email)
      } else {
        localStorage.removeItem('rememberEmail')
      }
      navigate('/dashboard')
    } catch (err) {
      setError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page" style={{
      minHeight: '100vh',
      background: '#f9fafb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <style>{`
        @media (max-width: 768px) {
          .login-page { padding: 16px !important; }
          .login-container { flex-direction: column !important; max-width: 440px !important; }
          .login-form-panel { min-width: 0 !important; padding: 24px 20px !important; }
        }
      `}</style>
      <div className="login-container" style={{
        display: 'flex',
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
        maxWidth: 900,
        width: '100%',
        overflow: 'hidden',
      }}>
        <div className="login-form-panel" style={{
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
          Sign in
        </h1>
        <p style={{
          fontSize: 14,
          color: '#6b7280',
          textAlign: 'center',
          margin: '0 0 24px',
        }}>
          Sign in to continue
        </p>

        <form onSubmit={handleSubmit}>
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
            {loading ? 'Signing in...' : 'Sign in'}
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
          No account?{' '}
          <Link to="/register" style={{ color: '#2563eb', textDecoration: 'underline' }}>
            Sign up
          </Link>
        </p>
        </div>
        <WelcomePanel
          title="Welcome back!"
          subtitle="You can sign in to access with your existing account."
        />
      </div>
    </div>
  )
}
