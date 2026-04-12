import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: '8px 12px',
      fontSize: 12
    }}>
      <div style={{ color: 'var(--green-bright)', fontWeight: 700, marginBottom: 4 }}>
        Score: {d.score}
      </div>
      <div style={{ color: 'var(--text-muted)' }}>{d.risk_level} RISK</div>
      <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>
        {d.success} success · {d.partial} partial
      </div>
    </div>
  )
}

export default function TrendChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
        <span className="card-title">Score Trend</span>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
          Run more scans to see trend data
        </div>
      </div>
    )
  }

  const chartData = data.map((d, i) => ({
    ...d,
    label: `Scan ${i + 1}`,
  }))

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      <span className="card-title">Score Trend</span>
      <div style={{ flex: 1, minHeight: 160 }}>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={80} stroke="var(--green-dim)" strokeDasharray="4 4" label={{ value: 'Target', fill: 'var(--text-muted)', fontSize: 9 }} />
            <Line
              type="monotone"
              dataKey="score"
              stroke="var(--green-bright)"
              strokeWidth={2}
              dot={{ fill: 'var(--green-bright)', r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: 'var(--green-bright)', stroke: 'var(--bg-card)', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}