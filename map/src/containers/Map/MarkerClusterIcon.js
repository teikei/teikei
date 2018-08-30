import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { config } from '../../index'

const countByType = features =>
  _.chain(features)
    .groupBy(feature => feature.properties.type.toLowerCase())
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
  count: PropTypes.number.isRequired
}

const MarkerClusterIcon = ({ features }) => (
  <div className="cluster-content">
    <div className="cluster-wrapper-outer">
      <div className="cluster-wrapper-inner">
        {countByType(features).map(renderIcons)}
      </div>
    </div>
  </div>
)

MarkerClusterIcon.propTypes = {
  features: PropTypes.arrayOf(PropTypes.object).isRequired
}

export default MarkerClusterIcon
