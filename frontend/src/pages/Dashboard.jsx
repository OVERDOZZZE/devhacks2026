import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import client from '../api/client'

export default function Dashboard() {
  const navigate = useNavigate()
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client.get('/interviews/')
      .then(res => {
        console.log(res.data)
        setInterviews(res.data)
      })
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  if (loading) return <p>Loading...</p>

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>My Interviews</h1>
        <div>
          <Link to="/interviews/new">
            <button>+ New Interview</button>
          </Link>
          <button onClick={handleLogout} style={{ marginLeft: 8 }}>Logout</button>
        </div>
      </div>

      {interviews.length === 0 && <p>No interviews yet. Start one!</p>}

      {interviews.map(interview => (
        <div key={interview.id} style={{ border: '1px solid #ccc', padding: 16, marginBottom: 12, borderRadius: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <strong>{interview.agent?.name || 'Unknown Agent'}</strong>
              <p style={{ margin: '4px 0', color: '#666' }}>
                {interview.number_of_questions} questions · {interview.status}
              </p>
              <p style={{ margin: 0, color: '#666', fontSize: 14 }}>
                {new Date(interview.created_at).toLocaleDateString()}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              {interview.overall_score && (
                <p style={{ fontSize: 24, fontWeight: 'bold', margin: 0 }}>
                  {interview.overall_score}/10
                </p>
              )}
              {interview.status === 'completed' && (
                <button onClick={() => navigate(`/interviews/${interview.id}/results`)}>
                  View Results
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
