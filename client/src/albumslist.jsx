import { useEffect, useState } from 'react'

function AlbumsList() {
  const [albums, setAlbums] = useState([])
  const [context, setContext] = useState({})
  const [selectedAlbum, setSelectedAlbums] = useState(new Set())

  useEffect(() => {
    fetch('http://localhost:3001/api/albums')
      .then(res => res.json())
      .then(data => setAlbums(data))
  }, [])

  function handleClick(artist, album, index) {

    fetch(`http://localhost:3001/api/context?artist=${artist}&album=${album}`)
      .then(res => res.json())
      .then(data => setContext(prev => ({ ...prev, [index]: data.context })))

    if (selectedAlbum.has(index)) {
      const newSet = new Set(selectedAlbum)
      newSet.delete(index)
      setSelectedAlbums(newSet)
    } else {
      const newSet = new Set(selectedAlbum)
      newSet.add(index)
      setSelectedAlbums(newSet)
    }
  }

  return (
    <ul>
      {albums.map((album, i) => (
        <li key={i} onClick={() => handleClick(album.artist.name, album.name, i)}>
          {album.artist.name} - {album.name}
          {selectedAlbum.has(i) && <p>{context[i]}</p>}
        </li>
      ))}
    </ul>
  )
}

export default AlbumsList