import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import client from '../api/client'

const AGENTS = [
  {
    id: 1,
    name: 'Emma',
    image: 'https://cdn.discordapp.com/attachments/1474491492037824669/1474782412239011860/AOI_d_9Wsragw139FV1zWp05qfIEEYjzAPloFQIXcmpLZ7QmGKn8QSKQkBfxgiAc0qX9JtK2VAiqV6zFEFL4XUQEe80NKYgMHe2ZDULOGnoWfUBOscS-tPBuNpQEP0Wf8fTbNohrWZysfmIYS4zI4oVT8R_glAbi0WzQiq7ER1XkbiOZhlK2jQs1024-rj.png?ex=699b19a7&is=6999c827&hm=42bb63738004f5ececa7a8be2bc1bbb7bc5beb417fd681781ecd4b1413da6c9e',
  },
  {
    id: 2,
    name: 'Jack',
    image: 'https://cdn.discordapp.com/attachments/1474491492037824669/1474782763423891694/AOI_d__ybRag-d8_rzpq2pOviOsoaKChjzqVTBo2S7dUoqd85QeC9J49NEr2bxEE661-6P8qX7Mq4cgrlzrIefO_nVDBdHT_qfAx7Em6r7bE2C7wzXWBAncG1v_lGuVTTI7HYnxVxKM_3VSNghV6njBtoMdVIbtDk3Ij9e0_VCcQVB0H0SIfxAs1024-rj.png?ex=699b19fa&is=6999c827&hm=f86cd5e53986d57f46e0df8c3e496656f403c666bda8301a545d8451afff889a',
  },
  {
    id: 3,
    name: 'Patel',
    image: 'https://cdn.discordapp.com/attachments/1474491492037824669/1474782008256237609/telegram-cloud-photo-size-2-5247190567077221039-y.jpg?ex=699b1946&is=6999c7c6&hm=8a340471bb83574c946e4960bf35f1c4d2428121ae8fa5178d4474749b450ef8',
  },
]

export default function NewInterview() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ agent_id: '', job_description: '', number_of_questions: 5 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#1a1a1a', marginBottom: 10 }}>
                Agent
              </label>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {AGENTS.map(agent => (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() => setForm({ ...form, agent_id: String(agent.id) })}
                    style={{
                      flex: 1,
                      minWidth: 120,
                      padding: agent.image ? '12px 16px' : '14px 16px',
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
                      gap: 8,
                    }}
                  >
                    {agent.image ? (
                      <>
                        <img
                          src={agent.image}
                          alt={agent.name}
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            objectFit: 'cover',
                          }}
                        />
                        <span>{agent.name}</span>
                      </>
                    ) : (
                      agent.name
                    )}
                  </button>
                ))}
              </div>
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
              disabled={loading || !form.agent_id}
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