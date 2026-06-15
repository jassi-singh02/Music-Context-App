import { useEffect, useState } from 'react'

const API_BASE = 'http://localhost:3001/api'

function AlbumsList({ username }) {
  const [albums, setAlbums] = useState([])
  const [context, setContext] = useState({})
  const [openAlbums, setOpenAlbums] = useState(new Set())
  const [loadingAlbums, setLoadingAlbums] = useState(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`${API_BASE}/albums?username=${encodeURIComponent(username)}`)
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.error || 'Failed to load albums')
        setAlbums(data)
      })
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [username])

  function handleClick(artist, album, index) {
    if (openAlbums.has(index)) {
      const next = new Set(openAlbums)
      next.delete(index)
      setOpenAlbums(next)
      return
    }

    setOpenAlbums(prev => new Set(prev).add(index))

    if (context[index]) return

    setLoadingAlbums(prev => new Set(prev).add(index))
    fetch(`${API_BASE}/context?artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(album)}`)
      .then(res => res.json())
      .then(data => {
        setContext(prev => ({ ...prev, [index]: data.context }))
        setLoadingAlbums(prev => {
          const next = new Set(prev)
          next.delete(index)
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
    <div className="album-grid">
      {albums.map((album, i) => {
        const cover = album.image?.find(img => img.size === 'extralarge')?.['#text']
        const isOpen = openAlbums.has(i)

        return (
          <div className="album-card" key={i}>
            {cover && <img className="album-cover" src={cover} alt={`${album.name} cover art`} />}
            <div className="album-info">
              <h3 className="album-name">{album.name}</h3>
              <p className="album-artist">{album.artist.name}</p>
              <button
                className="context-button"
                onClick={() => handleClick(album.artist.name, album.name, i)}
              >
                {isOpen ? 'Hide Context' : 'Show Context'}
              </button>
              {isOpen && (
                <div className="album-context">
                  {loadingAlbums.has(i) ? 'Loading context...' : context[i]}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default AlbumsList
