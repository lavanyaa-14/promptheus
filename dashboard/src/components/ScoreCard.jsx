export default function ScoreCard({ score, riskLevel, totalAttacks, success, partial, failure, timestamp }) {
  const riskColor = {
    LOW:      'var(--green-bright)',
    MEDIUM:   'var(--amber)',
    HIGH:     'var(--red)',
    CRITICAL: 'var(--red)',
  }[riskLevel] || 'var(--text-secondary)'

  const scoreColor = score >= 80 ? 'var(--green-bright)'
                   : score >= 60 ? 'var(--amber)'
                   : 'var(--red)'

  const date = timestamp
  ? (() => {
      try {
        // Format: 20260406_114553
        const clean = timestamp.replace(/(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:$6')
        return new Date(clean).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      } catch {
        return timestamp
      }
    })()
  : '—'
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <span className="card-title">Posture Score</span>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 64, fontWeight: 300, color: scoreColor, lineHeight: 1 }}>
          {score}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>out of 100</div>
        <div style={{
          display: 'inline-block',
          marginTop: 8,
          padding: '3px 12px',
          borderRadius: 12,
          background: `${riskColor}22`,
          border: `1px solid ${riskColor}55`,
          color: riskColor,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.8px',
          textTransform: 'uppercase'
        }}>
          {riskLevel} RISK
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[
          { label: 'Total attacks', value: totalAttacks, color: 'var(--text-primary)' },
          { label: 'Successful',    value: success,      color: 'var(--red)' },
          { label: 'Partial',       value: partial,      color: 'var(--amber)' },
          { label: 'Failed',        value: failure,      color: 'var(--green-bright)' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: 'var(--text-muted)' }}>{label}</span>
            <span style={{ fontWeight: 600, color }}>{value}</span>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: 8 }}>
        Scanned {date}
      </div>
    </div>
  )
}