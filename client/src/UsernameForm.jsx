import { useState } from 'react'

const POPULAR_USERS = [
  { username: 'jsingh343', label: 'jsingh343 (mine - Jaskaran!)' },
]

function UsernameForm({ onSubmit, initialValue = '' }) {
  const [value, setValue] = useState(initialValue)
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = value.trim()

    if (!trimmed) {
      setError('Please enter a Last.fm username.')
      return
    }

    setError('')
    onSubmit(trimmed)
  }

  return (
    <form className="username-form" onSubmit={handleSubmit}>
      <label htmlFor="lastfm-username" className="username-label">
        Enter your Last.fm username
      </label>
      <div className="username-input-row">
        <input
          id="lastfm-username"
          type="text"
          className="username-input"
          placeholder="e.g. rj"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
        />
        <button type="submit" className="username-submit">
          View My Music
        </button>
      </div>
      {error && <p className="username-error">{error}</p>}

      <div className="preset-users">
        <span className="preset-users-label">Or try my profile:</span>
        <div className="preset-users-row">
          {POPULAR_USERS.map((user) => (
            <button
              key={user.username}
              type="button"
              className="preset-user-button"
              onClick={() => onSubmit(user.username)}
            >
              {user.label}
            </button>
          ))}
        </div>
      </div>
    </form>
  )
}

export default UsernameForm
