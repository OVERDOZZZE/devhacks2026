import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import client from '../api/client'

export default function Results() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [interview, setInterview] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client.get(`/interviews/${id}/`)
      .then(res => setInterview(res.data))
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p style={{ textAlign: 'center', marginTop: 100 }}>Loading results...</p>
  if (!interview) return null

  const scoreColor = (score) => {
    if (score >= 7) return '#27ae60'
    if (score >= 4) return '#f39c12'
    return '#e74c3c'
  }

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ margin: 0 }}>Interview Results</h1>
        <button onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
      </div>

      {/* Overall score */}
      <div style={{ textAlign: 'center', padding: 32, border: '1px solid #eee', borderRadius: 12, marginBottom: 32 }}>
        <p style={{ color: '#666', margin: '0 0 8px' }}>Overall Score</p>
        <p style={{
          fontSize: 72,
          fontWeight: 'bold',
          margin: '0 0 8px',
          color: scoreColor(interview.overall_score)
        }}>
          {interview.overall_score ?? '—'}<span style={{ fontSize: 32, color: '#999' }}>/10</span>
        </p>
        <p style={{ color: '#444', maxWidth: 500, margin: '16px auto 0' }}>
          {interview.overall_feedback ?? 'No overall feedback available.'}
        </p>
      </div>

      {/* Per-question breakdown */}
      <h2>Question Breakdown</h2>
      {interview.qa_pairs.map((qa, i) => (
        <div key={qa.id} style={{
          border: '1px solid #eee',
          borderRadius: 8,
          padding: 20,
          marginBottom: 16,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <p style={{ margin: '0 0 8px', color: '#888', fontSize: 13 }}>Question {i + 1}</p>
            {qa.score && (
              <span style={{
                fontWeight: 'bold',
                color: scoreColor(qa.score),
                fontSize: 18,
              }}>
                {qa.score}/10
              </span>
            )}
          </div>
          <p style={{ margin: '0 0 12px', fontWeight: 600 }}>{qa.question.text}</p>
          <p style={{ margin: '0 0 8px', color: '#555', background: '#f9f9f9', padding: 10, borderRadius: 6 }}>
            {qa.answer || <em style={{ color: '#aaa' }}>No answer given</em>}
          </p>
          {qa.feedback && (
            <p style={{ margin: 0, color: '#666', fontSize: 14, borderLeft: '3px solid #ddd', paddingLeft: 10 }}>
              {qa.feedback}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}