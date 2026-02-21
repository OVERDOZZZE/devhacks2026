import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import client from '../api/client'

const sidebarWidth = 220
const bodyFont = "'Inter', sans-serif"

export default function Dashboard() {
  const navigate = useNavigate()
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client.get('/interviews/')
      .then(res => setInterviews(res.data))
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false))
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: bodyFont, color: '#6b7280', fontSize: 15 }}>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex' }}>
      {/* Sidebar */}
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
              background: '#f3f4f6',
              color: '#1a1a1a',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 500,
              fontFamily: bodyFont,
            }}
          >
            Interviews
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

      {/* Main content */}
      <main style={{ flex: 1, padding: 32, overflow: 'auto', fontFamily: bodyFont }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h1 style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 24,
              fontWeight: 700,
              color: '#1a1a1a',
              margin: '0 0 4px',
            }}>
              My Interviews
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: '#6b7280', fontFamily: bodyFont }}>
              Your interview sessions and results.
            </p>
          </div>
          <Link to="/interviews/new">
            <button style={{
              padding: '10px 20px',
              borderRadius: 8,
              border: 'none',
              background: '#000',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}>
              + New Interview
            </button>
          </Link>
        </div>

        {interviews.length === 0 && (
          <p style={{ color: '#6b7280', fontSize: 15, fontFamily: bodyFont }}>No interviews yet. Start one!</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {interviews.map(interview => (
            <div
              key={interview.id}
              style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                padding: 20,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <strong style={{ fontSize: 16, color: '#1a1a1a' }}>
                    {interview.agent?.name || 'Unknown Agent'}
                  </strong>
                  <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: 14 }}>
                    {interview.number_of_questions} questions · {interview.status}
                  </p>
                  <p style={{ margin: '2px 0 0', color: '#9ca3af', fontSize: 13 }}>
                    {new Date(interview.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {interview.overall_score != null && (
                    <p style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', margin: '0 0 8px' }}>
                      {interview.overall_score}/10
                    </p>
                  )}
                  {interview.status === 'completed' && (
                    <button
                      onClick={() => navigate(`/interviews/${interview.id}/results`)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 8,
                        border: 'none',
                        background: '#2563eb',
                        color: '#fff',
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                    >
                      View Results
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
