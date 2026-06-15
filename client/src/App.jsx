import { useEffect, useState } from 'react'
import AlbumsList from "./albumslist"
import UsernameForm from "./UsernameForm"

const USERNAME_STORAGE_KEY = 'musicContext.lastfmUsername'

function App() {
  const [username, setUsername] = useState(() => localStorage.getItem(USERNAME_STORAGE_KEY) || '')

  useEffect(() => {
    if (username) {
      localStorage.setItem(USERNAME_STORAGE_KEY, username)
    } else {
      localStorage.removeItem(USERNAME_STORAGE_KEY)
    }
  }, [username])

  return (
    <div className="app">
      <header className="app-header">
        <h1>Music Context</h1>
        <p className="app-subtitle">Your top albums this week — click one for AI-generated description</p>
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
          <AlbumsList key={username} username={username} />
        </>
      ) : (
        <UsernameForm onSubmit={setUsername} />
      )}
    </div>
  )
}

export default App
