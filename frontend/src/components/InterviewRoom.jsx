import { useState, useEffect, useCallback } from 'react'
import { useDataChannel } from '@livekit/components-react'

const bodyFont = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
const headingFont = "'DM Sans', sans-serif"

export default function InterviewRoom({
  interviewId,
  qaPairs,
  onComplete,
  onEndSession,
  jobDescription = '',
  roleTitle = 'Interview',
  companyName = '',
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [scores, setScores] = useState({}) // qa_id -> score if we get it later
  const [status, setStatus] = useState('agent_speaking')
  const [sessionStartMs, setSessionStartMs] = useState(() => Date.now())
  const [elapsedSec, setElapsedSec] = useState(0)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem(`interview_${interviewId}_notes`)
    if (stored) setNotes(stored)
  }, [interviewId])

  useEffect(() => {
    if (!sessionStartMs) return
    const t = setInterval(() => setElapsedSec(Math.floor((Date.now() - sessionStartMs) / 1000)), 1000)
    return () => clearInterval(t)
  }, [sessionStartMs])

  const persistNotes = useCallback((value) => {
    setNotes(value)
    try {
      localStorage.setItem(`interview_${interviewId}_notes`, value)
    } catch (_) {}
  }, [interviewId])

  useDataChannel('interview', (msg) => {
    try {
      const data = JSON.parse(new TextDecoder().decode(msg.payload))

      if (data.type === 'question_index') {
        setCurrentIndex(data.index)
        setStatus('agent_speaking')
      }

      if (data.type === 'question_asked') {
        setStatus('listening')
      }

      if (data.type === 'answer_captured') {
        const { qa_id, answer, score } = data
        setAnswers(prev => {
          const updated = { ...prev, [qa_id]: answer }
          const stored = JSON.parse(localStorage.getItem(`interview_${interviewId}`) || '{}')
          localStorage.setItem(`interview_${interviewId}`, JSON.stringify({ ...stored, answers: updated }))
          return updated
        })
        if (score != null) setScores(prev => ({ ...prev, [qa_id]: score }))
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
  const total = qaPairs.length
  const progressPct = total ? (currentIndex / total) * 100 : 0
  const headerRole = roleTitle || (jobDescription ? jobDescription.slice(0, 40) + (jobDescription.length > 40 ? '…' : '') : 'Interview')
  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const isAnswered = (qa) => qa && answers[qa.id] != null
  const recommendedMin = total ? Math.max(1, Math.ceil(total * 4)) : 0

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: bodyFont }}>
      {/* Header */}
      <header style={{
        background: '#0f172a',
        color: '#fff',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div style={{ fontFamily: headingFont, fontWeight: 700, fontSize: 18 }}>InterviewAI•</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, justifyContent: 'center', minWidth: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 500 }}>{headerRole}</span>
          {companyName && (
            <>
              <span style={{ color: '#94a3b8', fontSize: 14 }}>|</span>
              <span style={{ fontSize: 14 }}>{companyName}</span>
            </>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            fontWeight: 600,
            color: '#fef2f2',
            background: '#dc2626',
            padding: '4px 10px',
            borderRadius: 999,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', animation: 'pulse 1.5s ease-in-out infinite' }} />
            Live
          </span>
          {onEndSession && (
            <button
              type="button"
              onClick={onEndSession}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                border: '1px solid #fff',
                background: 'transparent',
                color: '#fff',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              End session
            </button>
          )}
        </div>
      </header>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>

      {/* Main: two columns */}
      <div className="interview-room-grid" style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 280px',
        gap: 24,
        padding: 24,
        maxWidth: 1200,
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
          {/* Progress */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8, letterSpacing: '0.5px' }}>PROGRESS</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                flex: 1,
                height: 8,
                background: '#e2e8f0',
                borderRadius: 999,
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${progressPct}%`,
                  height: '100%',
                  background: '#0f172a',
                  borderRadius: 999,
                  transition: 'width 0.3s ease',
                }} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{currentIndex + 1} / {total}</span>
            </div>
          </div>

          {/* Current question card */}
          <div style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 24,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#475569',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 700,
              }}>
                {currentIndex + 1}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b', letterSpacing: '0.5px' }}>CURRENT QUESTION</span>
            </div>
            <p style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 600,
              color: '#0f172a',
              lineHeight: 1.4,
            }}>
              {currentQA?.question?.text || '—'}
            </p>
          </div>

          {/* Mic card */}
          <div style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 32,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            textAlign: 'center',
          }}>
            <p style={{ margin: '0 0 16px', fontSize: 15, color: '#475569', fontWeight: 500 }}>
              {status === 'agent_speaking' && 'Listen to the question…'}
              {status === 'listening' && 'Speak your answer now'}
              {status === 'done' && 'Interview complete'}
            </p>
            <div style={{
              width: 72,
              height: 72,
              margin: '0 auto 12px',
              borderRadius: '50%',
              background: status === 'listening' ? '#0f172a' : '#334155',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'default',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="22" />
              </svg>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>Hold Space or click the mic to toggle</p>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Session time */}
          <div style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 20,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8, letterSpacing: '0.5px' }}>SESSION TIME</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', fontFamily: headingFont }}>{formatTime(elapsedSec)}</div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>{recommendedMin} min recommended</div>
          </div>

          {/* Questions list */}
          <div style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 20,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            flex: 1,
            minHeight: 200,
            overflow: 'auto',
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 12, letterSpacing: '0.5px' }}>QUESTIONS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {qaPairs.map((qa, i) => {
                const isCurrent = i === currentIndex
                const answered = isAnswered(qa)
                const score = qa && scores[qa.id]
                const shortText = qa?.question?.text ? (qa.question.text.slice(0, 42) + (qa.question.text.length > 42 ? '…' : '')) : `Question ${i + 1}`
                return (
                  <div
                    key={qa?.id ?? i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 10px',
                      borderRadius: 8,
                      background: isCurrent ? '#0f172a' : 'transparent',
                      color: isCurrent ? '#fff' : '#0f172a',
                    }}
                  >
                    {answered ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><path d="M20 6L9 17l-5-5" /></svg>
                    ) : (
                      <div style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: isCurrent ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                        color: isCurrent ? '#fff' : '#64748b',
                        fontSize: 11,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {i + 1}
                      </div>
                    )}
                    <span style={{ flex: 1, fontSize: 13, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shortText}</span>
                    {score != null && <span style={{ fontSize: 12, fontWeight: 600, flexShrink: 0 }}>{score}/10</span>}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Notes */}
          <div style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 20,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 10, letterSpacing: '0.5px' }}>YOUR NOTES</div>
            <textarea
              value={notes}
              onChange={(e) => persistNotes(e.target.value)}
              placeholder="Jot down key points before answering…"
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 13,
                color: '#0f172a',
                background: '#fff',
                resize: 'vertical',
                boxSizing: 'border-box',
                fontFamily: bodyFont,
              }}
            />
          </div>
        </div>
      </div>

      {/* Responsive: stack on narrow */}
      <style>{`
        @media (max-width: 900px) {
          .interview-room-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
