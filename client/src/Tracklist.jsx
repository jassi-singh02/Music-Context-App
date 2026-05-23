import { useEffect, useState } from 'react'

function TrackList() {
  const [tracks, setTracks] = useState([])
  const [context, setContext] = useState({})
  const [selectedTrack, setSelectedTracks] = useState(new Set())

  useEffect(() => {
    fetch('http://localhost:3001/api/tracks')
      .then(res => res.json())
      .then(data => setTracks(data))
  }, [])

  function handleClick(artist, track, index) {

    fetch(`http://localhost:3001/api/context?artist=${artist}&track=${track}`)
      .then(res => res.json())
      .then(data => setContext(prev => ({ ...prev, [index]: data.context })))

    if (selectedTrack.has(index)) {
      const newSet = new Set(selectedTrack)
      newSet.delete(index)
      setSelectedTracks(newSet)
    } else {
      const newSet = new Set(selectedTrack)
      newSet.add(index)
      setSelectedTracks(newSet)
    }
  }

  return (
    <ul>
      {tracks.map((track, i) => (
        <li key={i} onClick={() => handleClick(track.artist['#text'], track.name, i)}>
          {track.artist['#text']} - {track.name}
          {selectedTrack.has(i) && <p>{context[i]}</p>}
        </li>
      ))}
    </ul>
  )
}

export default TrackList