import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import client from '../api/client'

// Static image path by agent name (files in public/agents/: emma.png, jack.png, patel.png)
function getAgentImageUrl(name) {
  if (!name) return null
  return `/agents/${String(name).toLowerCase()}.png`
}

// Short description per agent (by name), shown under the name
function getAgentDescription(name) {
  if (!name) return ''
  const n = String(name).toLowerCase().trim()
  const descriptions = {
    emma: 'Female interviewer with a warm, conversational style—great for putting candidates at ease.',
    james: 'Direct, no-nonsense interviewer who keeps the pace tight and focuses on outcomes and experience.',
    marcus: 'Male interviewer focused on technical depth and structured questions.',
    sophie: 'Friendly interviewer who blends behavioral and situational questions with a relaxed tone.',
  }
  return descriptions[n] || ''
}

export default function NewInterview() {
  const navigate = useNavigate()
  const [agents, setAgents] = useState([])
  const [agentsLoading, setAgentsLoading] = useState(true)
  const [agentsError, setAgentsError] = useState('')
  const [form, setForm] = useState({ agent_id: '', job_description: '', number_of_questions: 5 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    client.get('/agents/')
      .then((res) => {
        if (!cancelled) setAgents(Array.isArray(res.data) ? res.data : [])
      })
      .catch(() => {
        if (!cancelled) setAgentsError('Failed to load agents.')
      })
      .finally(() => {
        if (!cancelled) setAgentsLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await client.post('/interviews/', form)
      navigate(`/interviews/${res.data.id}/session`)
    } catch (err) {
      setError('Failed to create interview.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="new-interview-page" style={{ minHeight: '100vh', background: '#f9fafb', padding: 24 }}>
      <style>{`
        @media (max-width: 600px) {
          .new-interview-page { padding: 16px !important; }
          .new-interview-page .back-wrap { top: 16px !important; left: 16px !important; }
          .new-interview-form-box { padding: 24px 20px !important; margin-top: 48px !important; }
          .new-interview-form-box h1 { font-size: 20px !important; }
          .agent-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <div className="back-wrap" style={{ position: 'absolute', top: 24, left: 24 }}>
        <Link to="/dashboard">
          <button
            type="button"
            style={{
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
            ← Back to Dashboard
          </button>
        </Link>
      </div>

      <div style={{
        maxWidth: 560,
        margin: '0 auto',
        paddingTop: 60,
      }}>
        <div className="new-interview-form-box" style={{
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          padding: '32px 40px',
        }}>
          <h1 style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 24,
            fontWeight: 700,
            color: '#1a1a1a',
            margin: '0 0 4px',
          }}>
            New Interview
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 24px' }}>
            Choose an agent and configure your interview.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#1a1a1a', marginBottom: 10 }}>
                Agent
              </label>
              {agentsError && (
                <p style={{ color: '#dc2626', fontSize: 14, marginBottom: 10 }}>{agentsError}</p>
              )}
              {agentsLoading ? (
                <p style={{ fontSize: 14, color: '#6b7280' }}>Loading agents...</p>
              ) : (
                <div className="agent-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                  {agents.map((agent) => {
                    const imageUrl = getAgentImageUrl(agent.name)
                    const description = getAgentDescription(agent.name)
                    return (
                      <button
                        key={agent.id}
                        type="button"
                        onClick={() => setForm({ ...form, agent_id: String(agent.id) })}
                        style={{
                          width: '100%',
                          padding: imageUrl ? '14px 16px' : '16px',
                          border: form.agent_id === String(agent.id) ? '2px solid #000' : '1px solid #e5e7eb',
                          borderRadius: 8,
                          background: form.agent_id === String(agent.id) ? '#f3f4f6' : '#fff',
                          fontSize: 14,
                          fontWeight: 500,
                          color: '#1a1a1a',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 6,
                          textAlign: 'center',
                          boxSizing: 'border-box',
                        }}
                      >
                        {imageUrl ? (
                          <>
                            <img
                              src={imageUrl}
                              alt={agent.name}
                              style={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                objectFit: 'cover',
                              }}
                              onError={(e) => { e.target.style.display = 'none' }}
                            />
                            <span style={{ fontWeight: 600 }}>{agent.name}</span>
                            {description && (
                              <span style={{ fontSize: 12, fontWeight: 400, color: '#6b7280', lineHeight: 1.3 }}>
                                {description}
                              </span>
                            )}
                          </>
                        ) : (
                          <>
                            <span style={{ fontWeight: 600 }}>{agent.name}</span>
                            {description && (
                              <span style={{ fontSize: 12, fontWeight: 400, color: '#6b7280', lineHeight: 1.3 }}>
                                {description}
                              </span>
                            )}
                          </>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#1a1a1a', marginBottom: 6 }}>
                Job Description
              </label>
              <textarea
                name="job_description"
                value={form.job_description}
                onChange={handleChange}
                rows={4}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 14,
                  color: '#1a1a1a',
                  background: '#fff',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
                placeholder="Paste the job description here..."
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#1a1a1a', marginBottom: 6 }}>
                Number of Questions
              </label>
              <select
                name="number_of_questions"
                value={form.number_of_questions}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 14,
                  color: '#1a1a1a',
                  background: '#fff',
                }}
              >
                <option value={1}>1</option>
                <option value={3}>3</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
              </select>
            </div>

            {error && (
              <p style={{ color: '#dc2626', fontSize: 14, marginBottom: 16 }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || agentsLoading || !form.agent_id}
              style={{
                width: '100%',
                padding: '12px 24px',
                borderRadius: 8,
                border: 'none',
                background: '#000',
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Creating...' : 'Start Interview'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}