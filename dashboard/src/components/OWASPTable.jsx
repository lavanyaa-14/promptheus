export default function OWASPTable({ categories }) {
  const entries = Object.entries(categories).sort(([a], [b]) => a.localeCompare(b))

  const riskColor = (score) =>
    score >= 7 ? 'var(--red)'
    : score >= 4 ? 'var(--amber)'
    : 'var(--green-bright)'

  const riskBar = (score) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        flex: 1, height: 4, background: 'var(--border)',
        borderRadius: 2, overflow: 'hidden'
      }}>
        <div style={{
          width: `${score * 10}%`,
          height: '100%',
          background: riskColor(score),
          borderRadius: 2,
          transition: 'width 0.6s ease'
        }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: riskColor(score), minWidth: 28 }}>
        {score.toFixed(1)}
      </span>
    </div>
  )

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      <span className="card-title">OWASP LLM Top 10</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {entries.map(([catId, cs]) => (
          <div key={catId} style={{
            padding: '8px 10px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--green-bright)', marginRight: 6 }}>
                  {catId}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                  {cs.name}
                </span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                {cs.successes}S · {cs.partials}P · {cs.failures}F
              </div>
            </div>
            {riskBar(cs.risk_score)}
          </div>
        ))}
      </div>
    </div>
  )
}