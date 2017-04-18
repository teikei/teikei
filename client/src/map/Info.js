import React from 'react'
import { Link } from 'react-router'
import { MAP } from '../AppRouter'
import i18n from '../i18n'

const Info = () => (
  <article className="details">
    <div className="details-container">

      <div className="details-back">
        <Link to={MAP}>{i18n.t('nav.go_back')}</Link>
      </div>

      <div className="details-content">
      </div>

    </div>
  </article>
)

export default Info
