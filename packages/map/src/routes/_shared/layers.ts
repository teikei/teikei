import type { LayerProps } from '@vis.gl/react-maplibre'

export const clusterLayer: LayerProps = {
  id: 'clusters',
  type: 'circle',
  source: 'entries',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': [
      'step',
      ['get', 'point_count'],
      '#51bbd6',
      100,
      '#f1f075',
      750,
      '#f28cb1'
    ],
    'circle-radius': [
      'step',
      ['get', 'point_count'],
      10,
      50,
      20,
      100,
      30,
      750,
      40
    ]
  }
}

export const unclusteredPointLayer: LayerProps = {
  id: 'unclustered-point',
  type: 'circle',
  source: 'entries',
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-color': '#11b4da',
    'circle-radius': 16,
    'circle-stroke-width': 1,
    'circle-stroke-color': '#fff'
  }
}
