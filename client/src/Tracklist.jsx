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

// Here need to implement click handler to fetch context for each track
// useState to store selected track and context, and display context below the track list when a track is clicked
// add onClick function

export default TrackList