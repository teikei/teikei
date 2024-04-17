import _ from "lodash";
import PropTypes from "prop-types";

export const getLongitude = (feature) =>
  _.get(feature, "geometry.coordinates[0]");
export const getLatitude = (feature) =>
  _.get(feature, "geometry.coordinates[1]");

export const featurePropType = PropTypes.shape({
  type: PropTypes.oneOf(["Feature"]).isRequired,
  geometry: PropTypes.shape({
    type: PropTypes.oneOf(["Point"]).isRequired,
    coordinates: PropTypes.arrayOf(PropTypes.number).isRequired,
  }).isRequired,
  properties: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    city: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
  }).isRequired,
});

export const emptyFeature = {
  type: "Feature",
  geometry: {
    type: "Point",
    coordinates: [0, 0],
  },
  properties: {
    id: "",
    name: "",
    city: "",
    url: "",
    type: "",
  },
};
