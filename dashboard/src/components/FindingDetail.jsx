export default function FindingDetail({ finding: f, onClose }) {
  const verdict = f.judge_verdict || 'error'

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      zIndex: 200,
      display: 'flex',
      justifyContent: 'flex-end',
    }} onClick={onClose}>
      <div style={{
        width: 520,
        height: '100%',
        background: 'var(--bg-card)',
        borderLeft: '1px solid var(--border)',
        overflowY: 'auto',
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }} onClick={e => e.stopPropagation()}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>
              {f.payload_id}
            </span>
            <span className={`verdict-badge verdict-${verdict}`}>{verdict}</span>
            <span className={`severity-${f.severity}`} style={{ fontSize: 11, fontWeight: 600 }}>
              {f.severity}
            </span>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 4
          }}>×</button>
        </div>

        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
            {f.name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {f.category} · {f.attack_goal}
          </div>
        </div>

        {[
          { label: 'Payload sent', content: f.prompt, mono: true, color: 'var(--text-secondary)' },
          { label: 'Model response', content: f.response, mono: false, color: 'var(--text-primary)' },
        ].map(({ label, content, mono, color }) => (
          <div key={label}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6 }}>
              {label}
            </div>
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 12px',
              fontSize: 12,
              fontFamily: mono ? 'monospace' : 'inherit',
              color,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              maxHeight: 200,
              overflowY: 'auto',
              lineHeight: 1.6,
            }}>
              {content}
            </div>
          </div>
        ))}

        <div style={{
          background: 'var(--bg-secondary)',
          border: `1px solid var(--border-green)`,
          borderRadius: 'var(--radius-sm)',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--green-bright)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            AI Judge Verdict
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span className={`verdict-badge verdict-${verdict}`} style={{ fontSize: 13 }}>{verdict}</span>
            {f.judge_confidence != null && (
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {(f.judge_confidence * 100).toFixed(0)}% confidence
              </span>
            )}
          </div>
          {f.judge_evidence && (
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              "{f.judge_evidence}"
            </div>
          )}
          {f.judge_notes && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {f.judge_notes}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}