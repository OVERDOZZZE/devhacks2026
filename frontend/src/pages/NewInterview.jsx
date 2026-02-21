import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
    <div style={{ maxWidth: 500, margin: '60px auto', padding: 24 }}>
      <h1>New Interview</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>Agent</label><br />
          <select name="agent_id" value={form.agent_id} onChange={handleChange} required style={{ width: '100%', padding: 8 }}>
            <option value="">Select an agent</option>
            {agents.map(agent => (
              <option key={agent.id} value={agent.id}>{agent.name}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>Job Description (optional)</label><br />
          <textarea
            name="job_description"
            value={form.job_description}
            onChange={handleChange}
            rows={4}
            style={{ width: '100%', padding: 8 }}
            placeholder="Paste the job description here..."
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>Number of Questions</label><br />
          <select name="number_of_questions" value={form.number_of_questions} onChange={handleChange} style={{ width: '100%', padding: 8 }}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
          </select>
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" disabled={loading} style={{ width: '100%', padding: 12 }}>
          {loading ? 'Creating...' : 'Start Interview'}
        </button>
      </form>
    </div>
  )
}