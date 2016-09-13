import React from 'react'
import ReactDOM from 'react-dom'
import Search from './components/search.jsx'

ReactDOM.render(
  React.createElement(Search, { defaultValue: 'Ort' }),
  document.getElementById('controls-container')
)
