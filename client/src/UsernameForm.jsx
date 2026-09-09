import { useState } from 'react'

const SAMPLE_USERS = [
  { username: 'jsingh343', label: 'jsingh343 · the author’s library' },
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
    <form className="username-form" onSubmit={handleSubmit} noValidate>
      <label htmlFor="lastfm-username" className="username-label">
        Your Last.fm username
      </label>
      <p className="username-hint">
        Any public profile works. No sign-in needed.
      </p>
      <div className="username-input-row">
        <input
          id="lastfm-username"
          type="text"
          className="username-input"
          placeholder="e.g. rj"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck="false"
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? 'lastfm-username-error' : undefined}
          autoFocus
        />
        <button type="submit" className="button button--primary">
          View my albums
        </button>
      </div>
      {error && (
        <p id="lastfm-username-error" className="status status--error" role="alert">
          {error}
        </p>
      )}

      <div className="sample-users">
        <span className="sample-users-label">Or browse a sample library:</span>
        {SAMPLE_USERS.map((user) => (
          <button
            key={user.username}
            type="button"
            className="link-button"
            onClick={() => onSubmit(user.username)}
          >
            {user.label}
          </button>
        ))}
      </div>
    </form>
  )
}

export default UsernameForm
