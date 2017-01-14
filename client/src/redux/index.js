import React from 'react'
import ReactDOM from 'react-dom'
import Search from './components/search'

ReactDOM.render(
  React.createElement(Search, { defaultValue: 'Initiative oder Ort' }),
  document.getElementById('controls-container'),
)
