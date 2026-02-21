import { useEffect, useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import client from '../api/client'

const sidebarWidth = 240
const bodyFont = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
const headingFont = "'DM Sans', sans-serif"

const colors = {
  bg: '#f8fafc',
  surface: '#ffffff',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  primary: '#0f172a',
  primaryHover: '#1e293b',
  success: '#059669',
  successBg: '#ecfdf5',
  warning: '#d97706',
  warningBg: '#fffbeb',
  info: '#0284c7',
  infoBg: '#f0f9ff',
}
const radius = { sm: 6, md: 8, lg: 12 }
const shadow = '0 1px 3px rgba(15, 23, 42, 0.06)'
const shadowHover = '0 4px 12px rgba(15, 23, 42, 0.08)'

function formatDate(iso) {
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function normalizeStatus(s) {
  if (s == null) return ''
  const lower = String(s).toLowerCase().trim()
  if (lower === 'in progress') return 'in_progress'
  return lower
}

function StatusBadge({ status }) {
  const norm = normalizeStatus(status)
  const isCompleted = norm === 'completed'
  const isInProgress = norm === 'in_progress'
  const style = {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    textTransform: 'capitalize',
    fontFamily: bodyFont,
  }
  if (isCompleted) {
    return <span style={{ ...style, background: colors.successBg, color: colors.success }}>Completed</span>
  }
  if (isInProgress) {
    return <span style={{ ...style, background: colors.infoBg, color: colors.info }}>In progress</span>
  }
  return <span style={{ ...style, background: colors.warningBg, color: colors.warning }}>{status ?? 'Pending'}</span>
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') 

  useEffect(() => {
    client.get('/interviews/')
      .then(res => setInterviews(res.data || []))
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false))
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const stats = useMemo(() => {
    const completed = interviews.filter(i => normalizeStatus(i.status) === 'completed')
    const inProgress = interviews.filter(i => normalizeStatus(i.status) === 'in_progress')
    const withScore = completed.filter(i => i.overall_score != null)
    const avgScore = withScore.length
      ? (withScore.reduce((s, i) => s + Number(i.overall_score), 0) / withScore.length).toFixed(1)
      : null
    const completionRate = interviews.length ? Math.round((completed.length / interviews.length) * 100) : 0
    return {
      total: interviews.length,
      completed: completed.length,
      inProgress: inProgress.length,
      avgScore,
      completionRate,
    }
  }, [interviews])

  const filteredInterviews = useMemo(() => {
    let list = [...interviews].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    if (filter === 'completed') list = list.filter(i => normalizeStatus(i.status) === 'completed')
    if (filter === 'in_progress') list = list.filter(i => normalizeStatus(i.status) === 'in_progress')
    return list
  }, [interviews, filter])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: colors.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: bodyFont,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 32,
            height: 32,
            border: `3px solid ${colors.border}`,
            borderTopColor: colors.primary,
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ color: colors.textSecondary, fontSize: 14 }}>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-layout" style={{ height: '100vh', background: colors.bg, display: 'flex', overflow: 'hidden' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .dashboard-layout { flex-direction: column; height: auto; min-height: 100vh; }
          .dashboard-sidebar { width: 100% !important; height: auto !important; min-height: auto !important; flex-direction: row !important; flex-wrap: wrap !important; border-right: none !important; border-bottom: 1px solid #e2e8f0 !important; }
          .dashboard-sidebar nav { flex: 1 1 auto !important; flex-direction: row !important; flex-wrap: wrap !important; gap: 8 !important; padding: 12px !important; }
          .dashboard-sidebar .sidebar-logout { width: auto !important; min-width: 80px; border-top: none !important; border-left: 1px solid #e2e8f0 !important; }
          .dashboard-main { min-height: 50vh !important; }
        }
        @media (max-width: 600px) {
          .dashboard-header-inner { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
          .dashboard-content { padding: 16px !important; }
          .dashboard-header { padding: 16px 20px !important; }
          .dashboard-kpi { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
          .dashboard-kpi .kpi-card { padding: 14px !important; }
          .dashboard-kpi .kpi-value { font-size: 22px !important; }
          .dashboard-section-top { flex-direction: column !important; align-items: flex-start !important; }
          .dashboard-card-row { flex-direction: column !important; align-items: flex-start !important; }
          .dashboard-card-left { flex-wrap: wrap !important; }
        }
      `}</style>

      {/* Sidebar */}
      <aside className="dashboard-sidebar" style={{
        width: sidebarWidth,
        height: '100vh',
        background: colors.surface,
        borderRight: `1px solid ${colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflow: 'hidden',
      }}>
        <Link to="/dashboard" style={{ textDecoration: 'none' }}>
          <div style={{ padding: '24px 20px', borderBottom: `1px solid ${colors.border}`, cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40,
                height: 40,
                background: colors.primary,
                borderRadius: radius.md,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </div>
              <div>
                <div style={{ fontFamily: headingFont, fontWeight: 700, fontSize: 16, color: colors.text }}>
                  Dashboard
                </div>
                <div style={{ marginTop: 2, fontFamily: bodyFont, fontSize: 12, color: colors.textMuted }}>
                  {stats.total} total session{stats.total !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>
        </Link>
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          <Link
            to="/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: radius.md,
              background: colors.borderLight,
              color: colors.text,
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 500,
              fontFamily: bodyFont,
              marginBottom: 4,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></svg>
            Interviews
          </Link>
          <Link
            to="/cv"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: radius.md,
              background: 'transparent',
              color: colors.text,
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 500,
              fontFamily: bodyFont,
              marginBottom: 4,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
            CV Analysis
          </Link>
          <Link
            to="/profile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: radius.md,
              background: 'transparent',
              color: colors.text,
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 500,
              fontFamily: bodyFont,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            Profile
          </Link>
        </nav>
        <div className="sidebar-logout" style={{ padding: '16px 12px', borderTop: `1px solid ${colors.border}` }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '10px 16px',
              borderRadius: radius.md,
              border: 'none',
              background: colors.primary,
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: bodyFont,
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="dashboard-main" style={{
        flex: 1,
        minWidth: 0,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: bodyFont,
      }}>
        {/* Page header */}
        <header className="dashboard-header" style={{
          flexShrink: 0,
          padding: '24px 32px',
          borderBottom: `1px solid ${colors.border}`,
          background: colors.surface,
        }}>
          <div className="dashboard-header-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{
                fontFamily: headingFont,
                fontSize: 22,
                fontWeight: 700,
                color: colors.text,
                margin: '0 0 4px',
              }}>
                Interview overview
              </h1>
              <p style={{ margin: 0, fontSize: 14, color: colors.textSecondary }}>
                Track sessions, scores, and progress at a glance.
              </p>
            </div>
            <Link to="/interviews/new" style={{ textDecoration: 'none' }}>
              <button style={{
                padding: '10px 20px',
                borderRadius: radius.md,
                border: 'none',
                background: colors.primary,
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: bodyFont,
                boxShadow: shadow,
              }}>
                + New interview
              </button>
            </Link>
          </div>
        </header>

        <div className="dashboard-content" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 32 }}>
          {/* KPI cards */}
          <div className="dashboard-kpi" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 16,
            marginBottom: 28,
          }}>
            <div className="kpi-card" style={{
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: radius.lg,
              padding: 20,
              boxShadow: shadow,
            }}>
              <div style={{ fontSize: 13, color: colors.textMuted, fontWeight: 500, marginBottom: 4 }}>Total sessions</div>
              <div className="kpi-value" style={{ fontSize: 28, fontWeight: 700, color: colors.text, fontFamily: headingFont }}>{stats.total}</div>
            </div>
            <div className="kpi-card" style={{
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: radius.lg,
              padding: 20,
              boxShadow: shadow,
            }}>
              <div style={{ fontSize: 13, color: colors.textMuted, fontWeight: 500, marginBottom: 4 }}>Completed</div>
              <div className="kpi-value" style={{ fontSize: 28, fontWeight: 700, color: colors.success, fontFamily: headingFont }}>{stats.completed}</div>
              {stats.total > 0 && (
                <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>{stats.completionRate}% completion</div>
              )}
            </div>
            <div className="kpi-card" style={{
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: radius.lg,
              padding: 20,
              boxShadow: shadow,
            }}>
              <div style={{ fontSize: 13, color: colors.textMuted, fontWeight: 500, marginBottom: 4 }}>In progress</div>
              <div className="kpi-value" style={{ fontSize: 28, fontWeight: 700, color: colors.info, fontFamily: headingFont }}>{stats.inProgress}</div>
            </div>
            <div className="kpi-card" style={{
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: radius.lg,
              padding: 20,
              boxShadow: shadow,
            }}>
              <div style={{ fontSize: 13, color: colors.textMuted, fontWeight: 500, marginBottom: 4 }}>Average score</div>
              <div className="kpi-value" style={{ fontSize: 28, fontWeight: 700, color: colors.text, fontFamily: headingFont }}>
                {stats.avgScore != null ? `${stats.avgScore}/10` : '—'}
              </div>
            </div>
          </div>

          {/* Section: Interview history */}
          <section>
            <div className="dashboard-section-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <h2 style={{
                fontFamily: headingFont,
                fontSize: 16,
                fontWeight: 600,
                color: colors.text,
                margin: 0,
              }}>
                Interview history
              </h2>
              <div style={{ display: 'flex', gap: 4 }}>
                {['all', 'completed', 'in_progress'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: radius.sm,
                      border: `1px solid ${filter === f ? colors.primary : colors.border}`,
                      background: filter === f ? colors.primary : colors.surface,
                      color: filter === f ? '#fff' : colors.textSecondary,
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: 'pointer',
                      fontFamily: bodyFont,
                      textTransform: 'capitalize',
                    }}
                  >
                    {f === 'all' ? 'All' : f === 'completed' ? 'Completed' : 'In progress'}
                  </button>
                ))}
              </div>
            </div>

            {filteredInterviews.length === 0 ? (
              <div style={{
                background: colors.surface,
                border: `1px dashed ${colors.border}`,
                borderRadius: radius.lg,
                padding: 48,
                textAlign: 'center',
              }}>
                <p style={{ color: colors.textSecondary, fontSize: 15, margin: '0 0 8px' }}>
                  {interviews.length === 0
                    ? 'No interviews yet. Start your first session to see it here.'
                    : `No ${filter === 'all' ? '' : filter.replace('_', ' ') + ' '}interviews.`}
                </p>
                {interviews.length === 0 && (
                  <Link to="/interviews/new">
                    <button style={{
                      marginTop: 12,
                      padding: '10px 20px',
                      borderRadius: radius.md,
                      border: 'none',
                      background: colors.primary,
                      color: '#fff',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}>
                      Start interview
                    </button>
                  </Link>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filteredInterviews.map(interview => {
                  const agentName = interview.agent?.name || 'Unknown Agent'
                  const initial = agentName.charAt(0).toUpperCase()
                  return (
                    <div
                      key={interview.id}
                      className="dashboard-card-row"
                      style={{
                        background: colors.surface,
                        border: `1px solid ${colors.border}`,
                        borderRadius: radius.lg,
                        padding: '16px 20px',
                        boxShadow: shadow,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 16,
                        flexWrap: 'wrap',
                      }}
                    >
                      <div className="dashboard-card-left" style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
                        <div style={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          background: colors.borderLight,
                          color: colors.textSecondary,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 16,
                          fontWeight: 600,
                          flexShrink: 0,
                        }}>
                          {initial}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 15, fontWeight: 600, color: colors.text }}>{agentName}</div>
                          <div style={{ marginTop: 4, fontSize: 13, color: colors.textMuted }}>
                            {interview.number_of_questions} questions · {formatDate(interview.created_at)}
                          </div>
                        </div>
                        <StatusBadge status={interview.status} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                        {interview.overall_score != null && (
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Score</div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: colors.text }}>{interview.overall_score}/10</div>
                          </div>
                        )}
                        {normalizeStatus(interview.status) === 'completed' ? (
                          <button
                            onClick={() => navigate(`/interviews/${interview.id}/results`)}
                            style={{
                              padding: '8px 16px',
                              borderRadius: radius.md,
                              border: 'none',
                              background: colors.primary,
                              color: '#fff',
                              fontSize: 13,
                              fontWeight: 500,
                              cursor: 'pointer',
                              fontFamily: bodyFont,
                            }}
                          >
                            View results
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate(`/interviews/${interview.id}/session`)}
                            style={{
                              padding: '8px 16px',
                              borderRadius: radius.md,
                              border: `1px solid ${colors.border}`,
                              background: colors.surface,
                              color: colors.textSecondary,
                              fontSize: 13,
                              fontWeight: 500,
                              cursor: 'pointer',
                              fontFamily: bodyFont,
                            }}
                          >
                            Continue
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}