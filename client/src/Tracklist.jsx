import { useEffect, useState } from 'react'

function TrackList() {
  const [tracks, setTracks] = useState([])

  useEffect(() => {
    fetch('http://localhost:3001/api/tracks')
      .then(res => res.json())
      .then(data => setTracks(data))
  }, [])

  return (
    <ul>
      {tracks.map((track, i) => (
        <li key={i}>{track.artist['#text']} — {track.name}</li>
      ))}
    </ul>
  )
}

export default TrackList