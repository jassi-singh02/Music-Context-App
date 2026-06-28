import { useEffect, useState } from 'react'

const API_BASE = '/api'

const PERIOD_OPTIONS = [
  { value: '7day',    label: 'Last 7 days' },
  { value: '1month',  label: 'Last month' },
  { value: '3month',  label: 'Last 3 months' },
  { value: '6month',  label: 'Last 6 months' },
  { value: '12month', label: 'Last 12 months' },
  { value: 'overall', label: 'All time' },
]

function AlbumsList({ username, period, onPeriodChange, report, reportLoading, reportError, onGenerateReport }) {
  const [albums, setAlbums] = useState([])
  const [context, setContext] = useState({})
  const [openAlbums, setOpenAlbums] = useState(new Set())
  const [loadingAlbums, setLoadingAlbums] = useState(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setAlbums([])
    setOpenAlbums(new Set())
    setLoadingAlbums(new Set())
    setIsLoading(true)
    setError('')

    fetch(`${API_BASE}/albums?username=${encodeURIComponent(username)}&period=${period}`)
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.error || 'Failed to load albums')
        setAlbums(data)
      })
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [username, period])

  function handleClick(artist, albumName, albumKey) {
    if (openAlbums.has(albumKey)) {
      const next = new Set(openAlbums)
      next.delete(albumKey)
      setOpenAlbums(next)
      return
    }

    setOpenAlbums(prev => new Set(prev).add(albumKey))

    if (context[albumKey]) return

    setLoadingAlbums(prev => new Set(prev).add(albumKey))
    fetch(`${API_BASE}/context?artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(albumName)}`)
      .then(res => res.json())
      .then(data => {
        setContext(prev => ({ ...prev, [albumKey]: data.context }))
        setLoadingAlbums(prev => {
          const next = new Set(prev)
          next.delete(albumKey)
          return next
        })
      })
  }

  if (isLoading) {
    return <p className="albums-status">Loading top albums for {username}...</p>
  }

  if (error) {
    return <p className="albums-status albums-error">{error}</p>
  }

  if (albums.length === 0) {
    return <p className="albums-status">No top albums found for {username} this week.</p>
  }

  return (
    <>
      <div className="period-selector">
        {PERIOD_OPTIONS.map(opt => (
          <button
            key={opt.value}
            className={`period-button${period === opt.value ? ' period-button--active' : ''}`}
            onClick={() => onPeriodChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="album-list">
        {albums.map((album, i) => {
          const cover = album.image?.find(img => img.size === 'extralarge')?.['#text']
          const albumKey = `${album.artist.name}::${album.name}`
          const isOpen = openAlbums.has(albumKey)

          return (
            <div className="album-card" key={albumKey}>
              <div className="album-left">
                <span className="album-rank">{i + 1}</span>
                {cover && <img className="album-cover" src={cover} alt={`${album.name} cover art`} />}
              </div>
              <div className="album-info">
                <h3 className="album-name">{album.name}</h3>
                <p className="album-artist">{album.artist.name}</p>
                <p className="album-playcount">{Number(album.playcount).toLocaleString()} plays</p>
                <button
                  className="context-button"
                  onClick={() => handleClick(album.artist.name, album.name, albumKey)}
                >
                  {isOpen ? 'Hide Context' : 'Show Context'}
                </button>
              </div>
              {isOpen && (
                <div className="album-context-panel">
                  {loadingAlbums.has(albumKey) ? 'Loading context…' : context[albumKey]}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="report-section"> <h2>Listening Report </h2>
        {report ? (
          <>
            <p className="report-summary">{report.summary}</p>
            <h2>Album Recommendations</h2>
            <div className="report-recs">
              {report.recommendations.map((rec, i) => (
                <div className="report-rec" key={i}>
                  <div className="report-rec-albums">
                    <span className="report-rec-anchor">{rec.anchor}</span>
                    <span className="report-rec-arrow">→</span>
                    <span className="report-rec-suggestion">{rec.suggestion}</span>
                  </div>
                  <p className="report-rec-reason">{rec.reason}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {reportError && <p className="report-error">{reportError}</p>}
            <button
              className="report-button"
              onClick={onGenerateReport}
              disabled={reportLoading}
            >
              {reportLoading ? 'Generating report…' : 'Generate report'}
            </button>
          </>
        )}
      </div>
    </>
  )
}

export default AlbumsList
