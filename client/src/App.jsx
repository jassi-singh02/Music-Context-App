import { useEffect, useState } from 'react'
import AlbumsList from "./albumslist"
import UsernameForm from "./UsernameForm"

const USERNAME_STORAGE_KEY = 'musicContext.lastfmUsername'

function App() {
  const [username, setUsername] = useState(() => localStorage.getItem(USERNAME_STORAGE_KEY) || '')
  const [period, setPeriod] = useState('7day')
  const [report, setReport] = useState(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [reportError, setReportError] = useState('')

  useEffect(() => {
    setReport(null)
    setReportError('')
  }, [period])

  useEffect(() => {
    if (username) {
      localStorage.setItem(USERNAME_STORAGE_KEY, username)
    } else {
      localStorage.removeItem(USERNAME_STORAGE_KEY)
    }
  }, [username])

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
      <header className="app-header">
        <h1>Music Context</h1>
        <p className="app-subtitle">Your top albums — Select time period and click each one for AI-generated context</p>
      </header>

      {username ? (
        <>
          <div className="user-bar">
            <span className="user-bar-label">
              Showing data for <strong>{username}</strong>
            </span>
            <button className="change-user-button" onClick={() => setUsername('')}>
              Change user
            </button>
          </div>
          <AlbumsList
            username={username}
            period={period}
            onPeriodChange={setPeriod}
            report={report}
            reportLoading={reportLoading}
            reportError={reportError}
            onGenerateReport={handleGenerateReport}
          />
        </>
      ) : (
        <UsernameForm onSubmit={setUsername} />
      )}
      <br></br>
      <footer>
        <small>© {new Date().getFullYear()} Jaskaran Singh</small>
      </footer>
    </div>
  )
}

export default App
