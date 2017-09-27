import React from 'react'
import { Link } from 'react-router'
import { MAP } from '../AppRouter'
import i18n from '../i18n'

const Info = () => (
  <article className="overlay">
    <div className="overlay-container">

      <div className="overlay-back">
        <Link to={MAP}>{i18n.t('nav.go_back')}</Link>
      </div>

      <div className="overlay-content" />
    </div>
  </article>
)

export default Info
