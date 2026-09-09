import { useEffect, useState } from 'react'
import AlbumsList from './albumslist'
import UsernameForm from './UsernameForm'

const USERNAME_STORAGE_KEY = 'musicContext.lastfmUsername'

function App() {
  const [username, setUsername] = useState(() => localStorage.getItem(USERNAME_STORAGE_KEY) || '')
  const [period, setPeriod] = useState('7day')
  const [report, setReport] = useState(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [reportError, setReportError] = useState('')

  useEffect(() => {
    if (username) {
      localStorage.setItem(USERNAME_STORAGE_KEY, username)
    } else {
      localStorage.removeItem(USERNAME_STORAGE_KEY)
    }
  }, [username])

  // A report belongs to one user and one period; clear it when either changes.
  function clearReport() {
    setReport(null)
    setReportError('')
  }

  function handleUsernameChange(next) {
    clearReport()
    setUsername(next)
  }

  function handlePeriodChange(next) {
    clearReport()
    setPeriod(next)
  }

  function handleGenerateReport() {
    setReportLoading(true)
    setReportError('')
    fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, period }),
    })
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.error || 'Failed to generate report')
        setReport(data)
      })
      .catch(err => setReportError(err.message))
      .finally(() => setReportLoading(false))
  }

  return (
    <div className="app">
      <header className="masthead">
        <h1 className="masthead-title">Music Context</h1>
        <p className="masthead-tagline">For each album, click to see AI generated context</p>
        {username && (
          <p className="masthead-user">
            Listening data for <strong>{username}</strong>
            <span className="masthead-user-sep" aria-hidden="true"></span>
            <button type="button" className="link-button" onClick={() => handleUsernameChange('')}>
              Change user
            </button>
          </p>
        )}
      </header>

      <main>
        {username ? (
          <AlbumsList
            key={`${username}::${period}`}
            username={username}
            period={period}
            onPeriodChange={handlePeriodChange}
            report={report}
            reportLoading={reportLoading}
            reportError={reportError}
            onGenerateReport={handleGenerateReport}
          />
        ) : (
          <UsernameForm onSubmit={handleUsernameChange} />
        )}
      </main>

      <footer className="colophon">
        <small>
          © {new Date().getFullYear()} Jaskaran Singh · Listening data from Last.fm · Context written by Claude Sonnet
        </small>
      </footer>
    </div>
  )
}

export default App
