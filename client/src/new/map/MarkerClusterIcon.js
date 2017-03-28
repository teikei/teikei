import React, { PropTypes } from 'react'
import _ from 'underscore'
import config from '../configuration'

const countByType = places => _.chain(places)
  .groupBy(place => place.type.toLowerCase())
  .map(({ length }, type) => ({ type, count: length }))
  .value()

const renderIcons = ({ type, count }) => (
  <div className={`cluster-item ${type}`} key={type}>
    <span className="cluster-value">{count}</span>
    <span className="cluster-icon">
      <img src={`${config.assetsBaseUrl}/icon-${type}.svg`} alt={type} />
    </span>
  </div>
)

renderIcons.propTypes = {
  type: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
}

const MarkerClusterIcon = ({ places }) => (
  <div className="cluster-content">
    <div className="cluster-wrapper-outer">
      <div className="cluster-wrapper-inner">
        { countByType(places).map(renderIcons) }
      </div>
    </div>
  </div>
)

MarkerClusterIcon.propTypes = {
  places: PropTypes.arrayOf(PropTypes.object).isRequired,
}

export default MarkerClusterIcon
