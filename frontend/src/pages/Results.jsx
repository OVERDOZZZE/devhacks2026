import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import client from '../api/client'

const POLL_INTERVAL = 3000
const POLL_TIMEOUT = 120000 // stop polling after 2 minutes

export default function Results() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [interview, setInterview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [scoring, setScoring] = useState(false)
  const pollTimer = useRef(null)
  const pollStart = useRef(null)

  const fetchInterview = async () => {
    try {
      const res = await client.get(`/interviews/${id}/`)
      const data = res.data

      setInterview(data)
      setLoading(false)

      const isScored = data.overall_score !== null && data.overall_score !== undefined
      if (isScored) {
        // Scoring done — stop polling
        setScoring(false)
        clearInterval(pollTimer.current)
      } else {
        // Still waiting for backend to score
        setScoring(true)
        if (!pollStart.current) {
          pollStart.current = Date.now()
        }
        if (Date.now() - pollStart.current > POLL_TIMEOUT) {
          // Give up after 2 minutes
          clearInterval(pollTimer.current)
          setScoring(false)
        }
      }
    } catch {
      clearInterval(pollTimer.current)
      navigate('/dashboard')
    }
  }

  useEffect(() => {
    fetchInterview()
    pollTimer.current = setInterval(fetchInterview, POLL_INTERVAL)
    return () => clearInterval(pollTimer.current)
  }, [])

  if (loading) return <p style={{ textAlign: 'center', marginTop: 100 }}>Loading results...</p>
  if (!interview) return null

  const scoreColor = (score) => {
    if (score >= 7) return '#27ae60'
    if (score >= 4) return '#f39c12'
    return '#e74c3c'
  }

  return (
    <div className="results-page" style={{ maxWidth: 700, margin: '40px auto', padding: 24 }}>
      <style>{`
        @media (max-width: 600px) {
          .results-page { margin: 20px auto !important; padding: 16px !important; }
          .results-header { flex-direction: column !important; align-items: flex-start !important; gap: 16px !important; }
        }
      `}</style>
      <div className="results-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ margin: 0 }}>Interview Results</h1>
        <button
          onClick={() => navigate('/dashboard')}
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
      </div>

      {scoring ? (
        <div style={{ textAlign: 'center', padding: 48, border: '1px solid #eee', borderRadius: 12, marginBottom: 32 }}>
          <p style={{ fontSize: 18, color: '#666' }}>⏳ Scoring your answers...</p>
          <p style={{ color: '#aaa', fontSize: 14 }}>This usually takes 15–30 seconds.</p>
        </div>
      ) : (
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
      )}

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
              <span style={{ fontWeight: 'bold', color: scoreColor(qa.score), fontSize: 18 }}>
                {qa.score}/10
              </span>
            )}
          </div>
          <p style={{ margin: '0 0 12px', fontWeight: 600 }}>{qa.question.text}</p>
          <p style={{ margin: '0 0 8px', color: '#555', background: '#f9f9f9', padding: 10, borderRadius: 6 }}>
            {qa.answer || <em style={{ color: '#aaa' }}>No answer given</em>}
          </p>
          {qa.feedback ? (
            <p style={{ margin: 0, color: '#666', fontSize: 14, borderLeft: '3px solid #ddd', paddingLeft: 10 }}>
              {qa.feedback}
            </p>
          ) : scoring ? (
            <p style={{ margin: 0, color: '#bbb', fontSize: 14, fontStyle: 'italic' }}>Feedback pending...</p>
          ) : null}
        </div>
      ))}
    </div>
  )
}