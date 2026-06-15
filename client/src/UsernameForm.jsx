import { useState } from 'react'

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
    </form>
  )
}

export default UsernameForm
