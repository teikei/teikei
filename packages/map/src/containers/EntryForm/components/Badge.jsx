import React from 'react'

const Badge = ({ name, url, logoUrl }) => (
  <div className='entries-badge'>
    <div onClick={(event) => event.preventDefault()}>
      {(name && name) || ''}
    </div>
    <a href={url} target='_blank' rel='noopener noreferrer'>
      <img className='entries-badge-image' src={logoUrl} height={50} />
    </a>
  </div>
)

export default Badge
