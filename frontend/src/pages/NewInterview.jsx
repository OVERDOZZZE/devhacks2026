import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import client from '../api/client'

export default function NewInterview() {
  const navigate = useNavigate()
  const [agents, setAgents] = useState([])
  const [form, setForm] = useState({ agent_id: '', job_description: '', number_of_questions: 5 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    client.get('/agents/').then(res => setAgents(res.data))
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
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: 24 }}>
      <div style={{ position: 'absolute', top: 24, left: 24 }}>
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
        maxWidth: 500,
        margin: '0 auto',
        paddingTop: 60,
      }}>
        <div style={{
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
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#1a1a1a', marginBottom: 6 }}>
                Agent
              </label>
              <select
                name="agent_id"
                value={form.agent_id}
                onChange={handleChange}
                required
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
                <option value="">Select an agent</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>{agent.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#1a1a1a', marginBottom: 6 }}>
                Job Description (optional)
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
              disabled={loading}
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
