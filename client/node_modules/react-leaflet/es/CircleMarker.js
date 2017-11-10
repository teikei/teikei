function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

import { CircleMarker as LeafletCircleMarker } from 'leaflet';
import PropTypes from 'prop-types';

import Path from './Path';
import children from './propTypes/children';
import latlng from './propTypes/latlng';

var CircleMarker = function (_Path) {
  _inherits(CircleMarker, _Path);

  function CircleMarker() {
    _classCallCheck(this, CircleMarker);

    return _possibleConstructorReturn(this, _Path.apply(this, arguments));
  }

  CircleMarker.prototype.createLeafletElement = function createLeafletElement(props) {
    return new LeafletCircleMarker(props.center, this.getOptions(props));
  };

  CircleMarker.prototype.updateLeafletElement = function updateLeafletElement(fromProps, toProps) {
    if (toProps.center !== fromProps.center) {
      this.leafletElement.setLatLng(toProps.center);
    }
    if (toProps.radius !== fromProps.radius) {
      this.leafletElement.setRadius(toProps.radius);
    }
  };

  return CircleMarker;
}(Path);

CircleMarker.propTypes = {
  center: latlng.isRequired,
  children: children,
  radius: PropTypes.number
};
export default CircleMarker;