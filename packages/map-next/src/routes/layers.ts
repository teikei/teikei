import type { CircleLayerSpecification } from 'maplibre-gl';

type CirclePaint = CircleLayerSpecification['paint'];

export const clusterPaint: CirclePaint = {
	'circle-color': ['step', ['get', 'point_count'], '#f28cb1', 10, '#f1f075', 50, '#51bbd6'],
	'circle-radius': ['step', ['get', 'point_count'], 10, 50, 20, 100, 30, 750, 40]
};

export const unclusteredPointPaint: CirclePaint = {
	'circle-color': '#11b4da',
	'circle-radius': 5,
	'circle-stroke-width': 1,
	'circle-stroke-color': '#fff'
};
