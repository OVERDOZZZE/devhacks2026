export default function WelcomePanel({ title, subtitle }) {
  return (
    <div style={{
      flex: 1,
      minWidth: 280,
      background: '#fafafa',
      borderLeft: '1px solid #e5e7eb',
      padding: 48,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Dot pattern top-right */}
      <div style={{
        position: 'absolute',
        top: 24,
        right: 24,
        width: 80,
        height: '100%',
        backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.08) 1.5px, transparent 1.5px)',
        backgroundSize: '8px 12px',
      }} />
      {/* Wavy shapes */}
      <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '40%', opacity: 0.4 }} viewBox="0 0 400 120" preserveAspectRatio="none">
        <path fill="none" stroke="#1a1a1a" strokeWidth="1.5" d="M0,60 Q100,20 200,60 T400,60 L400,120 L0,120 Z" opacity="0.15" />
        <path fill="none" stroke="#1a1a1a" strokeWidth="1" d="M0,80 Q150,40 300,80 T600,80" opacity="0.1" />
      </svg>
      <svg style={{ position: 'absolute', top: '30%', left: '-5%', width: '50%', height: '40%', opacity: 0.3 }} viewBox="0 0 200 200">
        <path fill="none" stroke="#1a1a1a" strokeWidth="1" d="M0,100 Q50,50 100,100 T200,100" opacity="0.12" />
        <path fill="none" stroke="#1a1a1a" strokeWidth="1" d="M0,120 Q60,80 120,120 T200,120" opacity="0.1" />
      </svg>
      {/* Plus signs and circles scattered */}
      {[...Array(6)].map((_, i) => (
        <span key={`plus-${i}`} style={{
          position: 'absolute',
          left: `${15 + i * 14}%`,
          top: `${20 + (i % 3) * 25}%`,
          color: 'rgba(0,0,0,0.12)',
          fontSize: 14,
          fontWeight: 300,
        }}>+</span>
      ))}
      {[...Array(5)].map((_, i) => (
        <span key={`circle-${i}`} style={{
          position: 'absolute',
          left: `${25 + (i * 18) % 60}%`,
          top: `${55 + (i % 2) * 30}%`,
          width: 6,
          height: 6,
          border: '1px solid rgba(0,0,0,0.12)',
          borderRadius: '50%',
        }} />
      ))}
      {/* Text content */}
      <h2 style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 28,
        fontWeight: 700,
        color: '#1a1a1a',
        margin: '0 0 12px',
        position: 'relative',
        zIndex: 1,
      }}>
        {title}
      </h2>
      <p style={{
        fontSize: 15,
        color: '#4b5563',
        margin: 0,
        lineHeight: 1.5,
        position: 'relative',
        zIndex: 1,
      }}>
        {subtitle}
      </p>
    </div>
  )
}
