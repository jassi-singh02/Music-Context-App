import { useEffect, useState } from 'react'

const API_BASE = '/api'

const PERIOD_OPTIONS = [
  { value: '7day',    label: 'Last 7 days',    phrase: 'in the last 7 days' },
  { value: '1month',  label: 'Last month',     phrase: 'in the last month' },
  { value: '3month',  label: 'Last 3 months',  phrase: 'in the last 3 months' },
  { value: '6month',  label: 'Last 6 months',  phrase: 'in the last 6 months' },
  { value: '12month', label: 'Last 12 months', phrase: 'in the last 12 months' },
  { value: 'overall', label: 'All time',       phrase: 'of all time' },
]

const SKELETON_ROWS = 10

// Context survives the list remounting when the user switches period.
const contextCache = new Map()

function periodOption(period) {
  return PERIOD_OPTIONS.find(opt => opt.value === period) ?? PERIOD_OPTIONS[0]
}

function withoutKey(set, key) {
  const next = new Set(set)
  next.delete(key)
  return next
}

function AlbumsList({ username, period, onPeriodChange, report, reportLoading, reportError, onGenerateReport }) {
  const [albums, setAlbums] = useState([])
  const [context, setContext] = useState({})
  const [contextErrors, setContextErrors] = useState({})
  const [openAlbums, setOpenAlbums] = useState(new Set())
  const [loadingAlbums, setLoadingAlbums] = useState(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // The parent remounts this component (via `key`) whenever username or period
  // changes, so initial state is always fresh and this effect only fetches.
  useEffect(() => {
    const controller = new AbortController()

    fetch(`${API_BASE}/albums?username=${encodeURIComponent(username)}&period=${period}`, {
      signal: controller.signal,
    })
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.error || 'Failed to load albums')
        setAlbums(data)
        setIsLoading(false)
      })
      .catch(err => {
        // A newer request superseded this one; let it drive the state.
        if (err.name === 'AbortError') return
        setError(err.message)
        setIsLoading(false)
      })

    return () => controller.abort()
  }, [username, period])

  function loadContext(artist, albumName, albumKey) {
    setContextErrors(prev => {
      const next = { ...prev }
      delete next[albumKey]
      return next
    })
    setLoadingAlbums(prev => new Set(prev).add(albumKey))

    fetch(`${API_BASE}/context?artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(albumName)}`)
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.error || 'Failed to load context')
        contextCache.set(albumKey, data)
        setContext(prev => ({ ...prev, [albumKey]: data }))
      })
      .catch(err => {
        setContextErrors(prev => ({ ...prev, [albumKey]: err.message || 'Failed to load context' }))
      })
      .finally(() => {
        setLoadingAlbums(prev => withoutKey(prev, albumKey))
      })
  }

  function toggleContext(artist, albumName, albumKey) {
    if (openAlbums.has(albumKey)) {
      setOpenAlbums(prev => withoutKey(prev, albumKey))
      return
    }

    setOpenAlbums(prev => new Set(prev).add(albumKey))

    if (context[albumKey] || loadingAlbums.has(albumKey)) return

    const cached = contextCache.get(albumKey)
    if (cached) {
      setContext(prev => ({ ...prev, [albumKey]: cached }))
      return
    }
    loadContext(artist, albumName, albumKey)
  }

  const { label: periodLabel, phrase: periodPhrase } = periodOption(period)
  const hasAlbums = !isLoading && !error && albums.length > 0

  let chartBody
  if (isLoading) {
    chartBody = (
      <ol className="album-list album-list--skeleton" aria-busy="true" aria-label="Loading albums">
        {Array.from({ length: SKELETON_ROWS }, (_, i) => (
          <li className="album-card" key={i}>
            <div className="album-row">
              <span className="album-rank">{String(i + 1).padStart(2, '0')}</span>
              <div className="album-cover skeleton" />
              <div className="album-info">
                <span className="skeleton skeleton-line skeleton-line--title" />
                <span className="skeleton skeleton-line skeleton-line--short" />
                <span className="skeleton skeleton-line skeleton-line--tiny" />
              </div>
            </div>
          </li>
        ))}
      </ol>
    )
  } else if (error) {
    chartBody = <p className="status status--error" role="alert">{error}</p>
  } else if (albums.length === 0) {
    chartBody = (
      <p className="status">
        No top albums found for <strong>{username}</strong> {periodPhrase}.
      </p>
    )
  } else {
    chartBody = (
      <ol className="album-list">
        {albums.map((album, i) => {
          const cover = album.image?.find(img => img.size === 'extralarge')?.['#text']
          const albumKey = `${album.artist.name}::${album.name}`
          const isOpen = openAlbums.has(albumKey)
          const isContextLoading = loadingAlbums.has(albumKey)
          const contextError = contextErrors[albumKey]
          const notes = context[albumKey]
          const panelId = `album-notes-${i}`

          return (
            <li className={`album-card${isOpen ? ' album-card--open' : ''}`} key={albumKey}>
              <div className="album-row">
                <span className="album-rank">{String(i + 1).padStart(2, '0')}</span>
                {cover ? (
                  <img className="album-cover" src={cover} alt="" loading="lazy" />
                ) : (
                  <div className="album-cover album-cover--empty" aria-hidden="true" />
                )}
                <div className="album-info">
                  <h3 className="album-name">{album.name}</h3>
                  <p className="album-artist">{album.artist.name}</p>
                  <p className="album-playcount">{Number(album.playcount).toLocaleString()} plays</p>
                </div>
                <button
                  type="button"
                  className="context-toggle"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggleContext(album.artist.name, album.name, albumKey)}
                >
                  {isOpen ? 'Hide' : 'Context'}
                  <span className="context-toggle-chevron" aria-hidden="true" />
                </button>
              </div>

              {isOpen && (
                <div className="album-notes" id={panelId}>
                  {isContextLoading ? (
                    <div className="notes-skeleton" aria-busy="true" aria-label="Loading context">
                      <span className="skeleton skeleton-line" />
                      <span className="skeleton skeleton-line" />
                      <span className="skeleton skeleton-line skeleton-line--short" />
                    </div>
                  ) : contextError ? (
                    <p className="status status--error" role="alert">
                      {contextError}{' '}
                      <button
                        type="button"
                        className="link-button"
                        onClick={() => loadContext(album.artist.name, album.name, albumKey)}
                      >
                        Try again
                      </button>
                    </p>
                  ) : notes && (
                    <>
                      <p className="eyebrow">Context</p>
                      <p className="notes-prose">{notes.context}</p>
                      {notes.recommendation && (
                        <div className="notes-rec">
                          <p className="eyebrow">If you like this</p>
                          <p className="rec-title">{notes.recommendation.suggestion}</p>
                          <p className="rec-reason">{notes.recommendation.reason}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ol>
    )
  }

  return (
    <>
      <section className="chart" aria-labelledby="chart-title">
        <div className="section-head">
          <div className="section-head-text">
            <p className="eyebrow">Top albums</p>
            <h2 className="section-title" id="chart-title">{periodLabel}</h2>
          </div>
          <nav className="period-selector" aria-label="Time period">
            {PERIOD_OPTIONS.map(opt => (
              <button
                type="button"
                key={opt.value}
                className={`period-button${period === opt.value ? ' period-button--active' : ''}`}
                aria-current={period === opt.value ? 'true' : undefined}
                onClick={() => onPeriodChange(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </nav>
        </div>
        {chartBody}
      </section>

      {hasAlbums && (
        <section className="report" aria-labelledby="report-title">
          <div className="section-head">
            <div className="section-head-text">
              <p className="eyebrow">Listening report</p>
              <h2 className="section-title" id="report-title">What ties it together</h2>
            </div>
          </div>

          {report ? (
            <div className="report-body">
              <blockquote className="through-line">{report.throughLine}</blockquote>
              <p className="report-summary">{report.summary}</p>
              {report.recommendations?.length > 0 && (
                <>
                  <p className="eyebrow">Where to go next</p>
                  <ol className="report-recs">
                    {report.recommendations.map((rec, i) => (
                      <li className="report-rec" key={i}>
                        <p className="rec-title">{rec.suggestion}</p>
                        <p className="rec-reason">{rec.reason}</p>
                      </li>
                    ))}
                  </ol>
                </>
              )}
            </div>
          ) : (
            <div className="report-empty">
              <p className="report-blurb">
                A short read on your top five {periodPhrase}: the thread connecting them, and a few albums that extend it.
              </p>
              {reportError && <p className="status status--error" role="alert">{reportError}</p>}
              <button
                type="button"
                className="button button--primary"
                onClick={onGenerateReport}
                disabled={reportLoading}
              >
                {reportLoading ? 'Writing the report…' : 'Generate report'}
              </button>
            </div>
          )}
        </section>
      )}
    </>
  )
}

export default AlbumsList
