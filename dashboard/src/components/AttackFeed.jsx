export default function AttackFeed({ findings, onSelect, selected }) {
  const verdictOrder = { success: 0, partial: 1, failure: 2, error: 3, null: 4 }
  const sorted = [...findings].sort((a, b) =>
    (verdictOrder[a.judge_verdict] ?? 4) - (verdictOrder[b.judge_verdict] ?? 4)
  )

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span className="card-title" style={{ margin: 0 }}>Attack Feed</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {findings.length} attacks · click to inspect
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 8,
        maxHeight: 420,
        overflowY: 'auto',
        paddingRight: 4
      }}>
        {sorted.map(f => {
          const isSelected = selected?.payload_id === f.payload_id
          const verdict = f.judge_verdict || 'error'

          return (
            <div
              key={f.payload_id}
              onClick={() => onSelect(isSelected ? null : f)}
              style={{
                padding: '10px 12px',
                background: isSelected ? 'var(--bg-hover)' : 'var(--bg-secondary)',
                border: `1px solid ${isSelected ? 'var(--border-green)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    {f.payload_id}
                  </span>
                  <span className={`verdict-badge verdict-${verdict}`}>
                    {verdict}
                  </span>
                </div>
                <span className={`severity-${f.severity}`} style={{ fontSize: 10, fontWeight: 600 }}>
                  {f.severity}
                </span>
              </div>

              <div style={{ fontSize: 12, color: 'var(--text-primary)', marginBottom: 4, fontWeight: 500 }}>
                {f.name}
              </div>

              {f.judge_evidence && (
                <div style={{
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  fontStyle: 'italic',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}>
                  "{f.judge_evidence}"
                </div>
              )}

              <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{f.category}</span>
                {f.judge_confidence != null && (
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                    {(f.judge_confidence * 100).toFixed(0)}% confidence
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}