import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'
import ScoreCard from './components/ScoreCard'
import OWASPTable from './components/OWASPTable'
import AttackFeed from './components/AttackFeed'
import FindingDetail from './components/FindingDetail'
import TrendChart from './components/TrendChart'

const API = 'http://localhost:5001'

export default function App() {
  const [data, setData]         = useState(null)
  const [trend, setTrend]       = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [isDark, setIsDark]     = useState(true)

  // Apply theme to root element
  useEffect(() => {
    document.documentElement.classList.toggle('light', !isDark)
  }, [isDark])

  // Load saved theme preference
  useEffect(() => {
    const saved = localStorage.getItem('promptheus-theme')
    if (saved === 'light') setIsDark(false)
  }, [])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    localStorage.setItem('promptheus-theme', next ? 'dark' : 'light')
  }

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/api/latest`),
      axios.get(`${API}/api/trend`)
    ])
      .then(([latestRes, trendRes]) => {
        setData(latestRes.data)
        setTrend(trendRes.data)
        setLoading(false)
      })
      .catch(() => {
        setError('Could not connect to PROMPTHEUS API. Is it running on port 5001?')
        setLoading(false)
      })
  }, [])

  const navbar = (
    <nav className="navbar">
      <span className="navbar-logo">PROMPTHEUS</span>
      <span className="navbar-tagline">LLM Red-Team Dashboard</span>
      <button className="theme-toggle" onClick={toggleTheme}>
        <span className="toggle-icon">{isDark ? '☀' : '◑'}</span>
        {isDark ? 'Light mode' : 'Dark mode'}
      </button>
      <div className="navbar-dot" title="API connected" />
    </nav>
  )

  if (loading) return (
    <div className="app">
      {navbar}
      <div className="loading">
        <div className="loading-dot" />
        <div className="loading-dot" />
        <div className="loading-dot" />
        <span style={{ marginLeft: 8, color: 'var(--text-muted)' }}>
          Loading scan results...
        </span>
      </div>
    </div>
  )

  if (error) return (
    <div className="app">
      {navbar}
      <div className="error-state">{error}</div>
    </div>
  )

  return (
    <div className="app">
      {navbar}

      <div className="main-content">
        <div className="top-row">
          <ScoreCard
            score={data.overall_score}
            riskLevel={data.risk_level}
            totalAttacks={data.total_attacks}
            success={data.total_success}
            partial={data.total_partial}
            failure={data.total_failure}
            timestamp={data.timestamp}
          />
          <TrendChart data={trend} />
          <OWASPTable categories={data.categories} />
        </div>

        <div className="middle-row">
          <AttackFeed
            findings={data.findings}
            onSelect={setSelected}
            selected={selected}
          />
        </div>
      </div>

      {selected && (
        <FindingDetail
          finding={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}