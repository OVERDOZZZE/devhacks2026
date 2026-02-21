import { useEffect, useState, useRef } from 'react' 
import { useNavigate, useParams } from 'react-router-dom'
import { LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react'
import client from '../api/client'
import InterviewRoom from '../components/InterviewRoom'

const LIVEKIT_URL = 'wss://interview-ai-agent-axxmcvn3.livekit.cloud'

export default function Session() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [token, setToken] = useState(null)
  const [qaPairs, setQaPairs] = useState([])
  const [phase, setPhase] = useState('loading')
  const [connected, setConnected] = useState(false)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    const init = async () => {
      try {
        const startRes = await client.post(`/interviews/${id}/start/`)
        const qa_pairs = startRes.data.qa_pairs
        setQaPairs(qa_pairs)

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

  if (phase === 'loading') return <p style={{ textAlign: 'center', marginTop: 100 }}>Preparing your interview...</p>
  if (phase === 'submitting') return <p style={{ textAlign: 'center', marginTop: 100 }}>Evaluating your performance...</p>

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
        ? <InterviewRoom interviewId={id} qaPairs={qaPairs} onComplete={handleInterviewComplete} />
        : <p style={{ textAlign: 'center', marginTop: 100 }}>Connecting to interview room...</p>
      }
    </LiveKitRoom>
  )
}