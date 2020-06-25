import React from 'react'

const Badge = ({ name, url, logoUrl }) => (
  <div className="entries-badge">
    {(name && name) || ''}
    <a href={url} target="_blank" rel="noopener noreferrer">
      <img
        className="entries-badge-image"
        src={`/assets${logoUrl}`}
        height={40}
      />
    </a>
  </div>
)

export default Badge
