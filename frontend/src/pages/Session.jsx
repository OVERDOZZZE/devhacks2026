import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react'
import client from '../api/client'
import InterviewRoom from '../components/InterviewRoom'

const LIVEKIT_URL = 'wss://interview-ai-agent-axxmcvn3.livekit.cloud'

const headingFont = "'DM Sans', sans-serif"

function SessionLoadingScreen({ message }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <style>{`
        @keyframes session-spin { to { transform: rotate(360deg); } }
        @keyframes session-pulse { 0%, 100% { opacity: 0.4; transform: scale(0.92); } 50% { opacity: 0.9; transform: scale(1); } }
        @keyframes session-dot { 0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; } 40% { transform: scale(1); opacity: 1; } }
      `}</style>
      <div style={{ position: 'relative', width: 80, height: 80 }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          border: '2px solid #e2e8f0',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          border: '2px solid transparent',
          borderTopColor: '#0f172a',
          borderRadius: '50%',
          animation: 'session-spin 1s linear infinite',
        }} />
        <div style={{
          position: 'absolute',
          inset: 8,
          border: '2px solid transparent',
          borderRightColor: 'rgba(15,23,42,0.6)',
          borderRadius: '50%',
          animation: 'session-spin 0.8s linear infinite reverse',
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'session-pulse 2s ease-in-out infinite',
        }}>
          <div style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: '#0f172a',
            boxShadow: '0 0 20px rgba(15,23,42,0.25)',
          }} />
        </div>
      </div>
      <p style={{
        marginTop: 28,
        fontSize: 16,
        fontWeight: 600,
        fontFamily: headingFont,
        color: '#0f172a',
        letterSpacing: '0.02em',
      }}>
        {message}
      </p>
      <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#64748b',
              animation: 'session-dot 1.2s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default function Session() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [token, setToken] = useState(null)
  const [qaPairs, setQaPairs] = useState([])
  const [interviewMeta, setInterviewMeta] = useState({ jobDescription: '', roleTitle: '', companyName: '' })
  const [phase, setPhase] = useState('loading')
  const [connected, setConnected] = useState(false)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    const init = async () => {
      try {
        const startRes = await client.post(`/interviews/${id}/start/`)
        const data = startRes.data
        const qa_pairs = data.qa_pairs || []
        setQaPairs(qa_pairs)
        setInterviewMeta({
          jobDescription: data.job_description || '',
          roleTitle: data.job_description ? data.job_description.slice(0, 50).trim() + (data.job_description.length > 50 ? '…' : '') : 'Interview',
          companyName: data.company_name || '',
        })

        localStorage.setItem(`interview_${id}`, JSON.stringify({
          qa_pairs,
          answers: {},
        }))

        const tokenRes = await client.get(`/livekit/get_token/?interview_id=${id}`)
        setToken(tokenRes.data.token)
        setPhase('interview')
      } catch (err) {
        console.error(err)
        navigate('/dashboard')
      }
    }

    init()
  }, [])

  const handleInterviewComplete = async (answers) => {
    setPhase('submitting')
    try {
      await client.post(`/interviews/${id}/complete/`, { answers })
      localStorage.removeItem(`interview_${id}`)
      navigate(`/interviews/${id}/results`)
    } catch (err) {
      console.error(err)
      alert('Failed to submit answers. Please try again.')
      setPhase('interview')
    }
  }

  if (phase === 'loading') return <SessionLoadingScreen message="Preparing your interview..." />
  if (phase === 'submitting') return <SessionLoadingScreen message="Evaluating your performance..." />

  return (
    <LiveKitRoom
      serverUrl={LIVEKIT_URL}
      token={token}
      connect={true}
      audio={true}
      video={false}
      onConnected={() => setConnected(true)}
      onDisconnected={() => setConnected(false)}
    >
      <RoomAudioRenderer />
      {connected
        ? (
            <InterviewRoom
              interviewId={id}
              qaPairs={qaPairs}
              onComplete={handleInterviewComplete}
              onEndSession={() => window.confirm('End session and return to dashboard?') && navigate('/dashboard')}
              jobDescription={interviewMeta.jobDescription}
              roleTitle={interviewMeta.roleTitle}
              companyName={interviewMeta.companyName}
            />
          )
        : <SessionLoadingScreen message="Connecting to interview room..." />
      }
    </LiveKitRoom>
  )
}
