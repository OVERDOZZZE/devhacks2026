import { useState } from 'react'
import { useDataChannel } from '@livekit/components-react'

export default function InterviewRoom({ interviewId, qaPairs, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  // 'agent_speaking' — agent is reading the question aloud
  // 'listening'      — candidate should speak their answer
  // 'done'           — interview complete
  const [status, setStatus] = useState('agent_speaking')

  useDataChannel('interview', (msg) => {
    try {
      const data = JSON.parse(new TextDecoder().decode(msg.payload))

      if (data.type === 'question_index') {
        setCurrentIndex(data.index)
        // Agent is about to speak the question — wait before prompting candidate
        setStatus('agent_speaking')
      }

      if (data.type === 'question_asked') {
        // Agent finished speaking, now candidate should answer
        setStatus('listening')
      }

      if (data.type === 'answer_captured') {
        const { qa_id, answer } = data
        setAnswers(prev => {
          const updated = { ...prev, [qa_id]: answer }
          const stored = JSON.parse(localStorage.getItem(`interview_${interviewId}`) || '{}')
          localStorage.setItem(`interview_${interviewId}`, JSON.stringify({
            ...stored,
            answers: updated,
          }))
          return updated
        })
        // Go back to agent_speaking while it transitions to the next question
        setStatus('agent_speaking')
      }

      if (data.type === 'interview_complete') {
        setStatus('done')
        onComplete(data.answers)
      }
    } catch (e) {
      console.error('Failed to parse agent message', e)
    }
  })

  const currentQA = qaPairs[currentIndex]

  return (
    <div style={{ maxWidth: 600, margin: '60px auto', padding: 24 }}>
      <p style={{ color: '#666' }}>
        Question {currentIndex + 1} of {qaPairs.length}
      </p>

      <h2>{currentQA?.question?.text}</h2>

      {status === 'agent_speaking' && (
        <p style={{ color: '#888' }}>🔊 Listen to the question...</p>
      )}

      {status === 'listening' && (
        <p style={{ color: '#e74c3c' }}>🎙️ Speak your answer now...</p>
      )}

      {status === 'done' && (
        <p style={{ color: '#27ae60' }}>✅ Interview complete. Submitting...</p>
      )}

      <div style={{ marginTop: 24, padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
        <p style={{ margin: 0, fontSize: 13, color: '#999' }}>
          Your microphone is active. The AI interviewer will guide you through each question.
        </p>
      </div>
    </div>
  )
}