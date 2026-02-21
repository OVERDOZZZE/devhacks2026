import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'

const bodyFont = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
const headingFont = "'DM Sans', sans-serif"

function scoreGrade(score) {
  if (score >= 85) return { label: 'Excellent' }
  if (score >= 70) return { label: 'Good' }
  if (score >= 50) return { label: 'Fair' }
  return { label: 'Needs Work' }
}

function ScoreRing({ score, size = 120, stroke = 9 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const progress = (score / 100) * circ

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="#000" strokeWidth={stroke}
          strokeDasharray={`${progress} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: size * 0.22, fontWeight: 800, color: '#000', fontFamily: headingFont, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: size * 0.1, color: '#94a3b8', fontFamily: bodyFont, marginTop: 2 }}>/ 100</span>
      </div>
    </div>
  )
}

function ScoreBar({ score }) {
  return (
    <div style={{ width: '100%' }}>
      <div style={{ height: 6, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${score}%`, background: '#000', borderRadius: 99, transition: 'width 1s cubic-bezier(0.4,0,0.2,1)' }} />
      </div>
    </div>
  )
}

function SectionCard({ section }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, background: '#fff', overflow: 'hidden', boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: '100%', background: 'none', border: 'none', padding: '16px 20px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 16 }}
      >
        <div style={{ minWidth: 48, height: 48, borderRadius: 10, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#fff', fontFamily: headingFont, lineHeight: 1 }}>{section.score}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: '#0f172a', fontFamily: headingFont }}>{section.label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: '#000', color: '#fff', fontFamily: bodyFont }}>
                {scoreGrade(section.score).label}
              </span>
              <span style={{ color: '#94a3b8', fontSize: 14, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>▾</span>
            </div>
          </div>
          <ScoreBar score={section.score} />
        </div>
      </button>

      {open && (
        <div style={{ padding: '0 20px 20px', borderTop: '1px solid #f1f5f9' }}>
          <p style={{ fontSize: 14, color: '#475569', margin: '14px 0 16px', lineHeight: 1.6, fontFamily: bodyFont }}>{section.summary}</p>
          {section.positives?.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#000', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px', fontFamily: bodyFont }}>✓ Strengths</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {section.positives.map((p, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ color: '#000', flexShrink: 0, marginTop: 2, fontSize: 13 }}>●</span>
                    <span style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, fontFamily: bodyFont }}>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {section.improvements?.length > 0 && (
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#444', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px', fontFamily: bodyFont }}>↑ Improvements</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {section.improvements.map((imp, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ color: '#444', flexShrink: 0, marginTop: 2, fontSize: 13 }}>●</span>
                    <span style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, fontFamily: bodyFont }}>{imp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function UploadZone({ onFile, uploading }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) onFile(f)
  }, [onFile])

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    setDragging(e.type === 'dragover')
  }, [])

  return (
    <div
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={() => !uploading && inputRef.current?.click()}
      style={{ border: `2px dashed ${dragging ? '#000' : '#e2e8f0'}`, borderRadius: 12, padding: '48px 32px', textAlign: 'center', cursor: uploading ? 'default' : 'pointer', background: dragging ? '#f1f5f9' : '#fff', transition: 'all 0.2s' }}
    >
      <input ref={inputRef} type="file" accept=".pdf,.txt,.md" style={{ display: 'none' }} onChange={(e) => e.target.files[0] && onFile(e.target.files[0])} />
      {uploading ? (
        <>
          <div style={{ marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, border: '3px solid #f1f5f9', borderTopColor: '#000', borderRadius: '50%', animation: 'cv-spin 0.8s linear infinite', margin: '0 auto' }} />
          </div>
          <p style={{ fontWeight: 600, fontSize: 15, color: '#0f172a', fontFamily: headingFont, margin: '0 0 4px' }}>Analysing your CV...</p>
          <p style={{ fontSize: 13, color: '#94a3b8', fontFamily: bodyFont, margin: 0 }}>This usually takes 10–20 seconds</p>
        </>
      ) : (
        <>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24 }}>📄</div>
          <p style={{ fontWeight: 700, fontSize: 16, color: '#0f172a', fontFamily: headingFont, margin: '0 0 6px' }}>Drop your CV here, or click to browse</p>
          <p style={{ fontSize: 13, color: '#94a3b8', fontFamily: bodyFont, margin: '0 0 16px' }}>Supports PDF, TXT, and MD files up to 5 MB</p>
          <div style={{ display: 'inline-block', padding: '8px 20px', borderRadius: 8, background: '#000', color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: bodyFont }}>Choose File</div>
        </>
      )}
    </div>
  )
}

export default function CVAnalysis() {
  const navigate = useNavigate()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [fileName, setFileName] = useState('')

  const handleFile = async (file) => {
    setError('')
    setResult(null)
    setFileName(file.name)
    setUploading(true)
    const formData = new FormData()
    formData.append('cv', file)
    try {
      const res = await client.post('/cv/analyse/', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      setResult(res.data)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to analyse CV. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const reset = () => { setResult(null); setError(''); setFileName('') }

  const sectionOrder = ['impact', 'clarity', 'skills', 'experience', 'ats']

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: bodyFont }}>
      <style>{`
        @keyframes cv-spin { to { transform: rotate(360deg); } }
        @keyframes cv-fadein { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        .cv-animated { animation: cv-fadein 0.4s ease both; }
        .cv-tag:hover { background: #000 !important; color: #fff !important; border-color: #000 !important; }
      `}</style>

      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(15,23,42,0.06)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => navigate('/dashboard')} style={{ border: '1px solid #e2e8f0', background: '#fff', color: '#0f172a', padding: '6px 14px', borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: bodyFont }}>
            ← Dashboard
          </button>
          <div style={{ width: 1, height: 20, background: '#e2e8f0' }} />
          <span style={{ fontFamily: headingFont, fontWeight: 700, fontSize: 16, color: '#0f172a' }}>CV Analyser</span>
        </div>
        {result && (
          <button onClick={reset} style={{ border: 'none', background: '#000', color: '#fff', padding: '7px 16px', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: bodyFont }}>
            + Analyse Another
          </button>
        )}
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px 64px' }}>
        {!result && (
          <div className="cv-animated">
            <div style={{ marginBottom: 32, textAlign: 'center' }}>
              <h1 style={{ fontFamily: headingFont, fontSize: 28, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>CV Analysis</h1>
              <p style={{ fontSize: 15, color: '#475569', margin: 0 }}>Upload your resume and get an instant, AI-powered review with detailed scoring across 5 dimensions.</p>
            </div>

            <UploadZone onFile={handleFile} uploading={uploading} />

            {error && (
              <div style={{ marginTop: 16, padding: '12px 16px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, color: '#dc2626', fontSize: 14, fontFamily: bodyFont }}>
                {error}
              </div>
            )}

            {!uploading && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 32 }}>
                {[
                  { icon: '', title: 'Impact Score', desc: 'Measures how results-driven your CV reads' },
                  { icon: '', title: 'ATS Check', desc: 'How well it passes applicant tracking systems' },
                  { icon: '', title: 'Instant Fixes', desc: 'Top 3 critical improvements to make today' },
                ].map((f) => (
                  <div key={f.title} style={{ padding: 16, borderRadius: 10, background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
                    <div style={{ fontSize: 22, marginBottom: 8 }}>{f.icon}</div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a', fontFamily: headingFont, marginBottom: 4 }}>{f.title}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>{f.desc}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {result && (
          <div className="cv-animated">
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '24px 28px', marginBottom: 24, boxShadow: '0 1px 3px rgba(15,23,42,0.06)', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              <ScoreRing score={result.overall_score} size={110} stroke={9} />
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                  <h2 style={{ fontFamily: headingFont, fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>{result.candidate_name}</h2>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: '#000', color: '#fff', fontFamily: bodyFont }}>
                    {scoreGrade(result.overall_score).label}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: '#475569', margin: '0 0 12px', fontFamily: bodyFont }}>
                  {result.current_role}
                  {result.years_experience > 0 && <span style={{ color: '#94a3b8' }}> · {result.years_experience} yr{result.years_experience !== 1 ? 's' : ''} experience</span>}
                  <span style={{ color: '#94a3b8' }}> · {fileName}</span>
                </p>
                <p style={{ fontSize: 14, color: '#475569', margin: 0, lineHeight: 1.65, fontFamily: bodyFont, maxWidth: 540 }}>{result.overall_summary}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 24 }}>
              {sectionOrder.map((key) => {
                const sec = result.sections?.[key]
                if (!sec) return null
                return (
                  <div key={key} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 12px', textAlign: 'center', boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#000', fontFamily: headingFont, lineHeight: 1 }}>{sec.score}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8', fontFamily: bodyFont, marginTop: 4, lineHeight: 1.3 }}>{sec.label}</div>
                    <div style={{ marginTop: 8 }}><ScoreBar score={sec.score} /></div>
                  </div>
                )
              })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div style={{ background: '#fafafa', border: '1px solid #e2e8f0', borderRadius: 10, padding: '18px 20px', boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
                <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: 13, color: '#0f172a', fontFamily: headingFont }}>Critical Fixes</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(result.critical_fixes || []).map((fix, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 700, fontSize: 12, color: '#000', flexShrink: 0, marginTop: 1, fontFamily: bodyFont }}>{i + 1}.</span>
                      <span style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, fontFamily: bodyFont }}>{fix}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: '#fafafa', border: '1px solid #e2e8f0', borderRadius: 10, padding: '18px 20px', boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
                <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: 13, color: '#0f172a', fontFamily: headingFont }}>Top Strengths</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(result.top_strengths || []).map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ color: '#000', flexShrink: 0, fontSize: 13, marginTop: 1 }}>✓</span>
                      <span style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, fontFamily: bodyFont }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontFamily: headingFont, fontWeight: 700, fontSize: 16, color: '#0f172a', margin: '0 0 14px' }}>Section Breakdown</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {sectionOrder.map((key) => {
                  const sec = result.sections?.[key]
                  return sec ? <SectionCard key={key} section={sec} /> : null
                })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {result.detected_skills?.length > 0 && (
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '18px 20px', boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
                  <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: 13, color: '#0f172a', fontFamily: headingFont }}>Detected Skills</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {result.detected_skills.map((skill, i) => (
                      <span key={i} className="cv-tag" style={{ fontSize: 12, padding: '4px 10px', borderRadius: 99, background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', fontFamily: bodyFont, fontWeight: 500, cursor: 'default', transition: 'all 0.15s' }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {result.industry_fit?.length > 0 && (
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '18px 20px', boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
                  <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: 13, color: '#0f172a', fontFamily: headingFont }}>Industry Fit</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {result.industry_fit.map((ind, i) => (
                      <span key={i} className="cv-tag" style={{ fontSize: 12, padding: '4px 10px', borderRadius: 99, background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', fontFamily: bodyFont, fontWeight: 500, cursor: 'default', transition: 'all 0.15s' }}>
                        {ind}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}