import config from '@/configuration'
import _ from 'lodash'

interface Feature {
  properties: {
    type: string
  }
}

interface RenderIconsProps {
  type: string
  count: number
}

interface MarkerClusterIconProps {
  features: Feature[]
}

const countByType = (features: Feature[]) =>
  _.chain(features)
    .groupBy((feature) => feature.properties.type.toLowerCase())
    .map((group, type) => ({ type, count: group.length }))
    .value()

const renderIcons = ({ type, count }: RenderIconsProps) => (
  <div className={`cluster-item ${type}`} key={type}>
    <span className='cluster-value'>{count}</span>
    <span className='cluster-icon'>
      <img src={`${config.assetsBaseUrl}/icon-${type}.svg`} alt={type} />
    </span>
  </div>
)

const MarkerClusterIcon = ({ features }: MarkerClusterIconProps) => (
  <div className='cluster-content'>
    <div className='cluster-wrapper-outer'>
      <div className='cluster-wrapper-inner'>
        {countByType(features).map(renderIcons)}
      </div>
    </div>
  </div>
)

export default MarkerClusterIcon
