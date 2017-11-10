function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

import { Icon, Marker as LeafletMarker } from 'leaflet';
import PropTypes from 'prop-types';

import MapLayer from './MapLayer';
import children from './propTypes/children';
import latlng from './propTypes/latlng';
import layer from './propTypes/layer';

var Marker = function (_MapLayer) {
  _inherits(Marker, _MapLayer);

  function Marker() {
    _classCallCheck(this, Marker);

    return _possibleConstructorReturn(this, _MapLayer.apply(this, arguments));
  }

  Marker.prototype.getChildContext = function getChildContext() {
    return {
      popupContainer: this.leafletElement
    };
  };

  Marker.prototype.createLeafletElement = function createLeafletElement(props) {
    return new LeafletMarker(props.position, this.getOptions(props));
  };

  Marker.prototype.updateLeafletElement = function updateLeafletElement(fromProps, toProps) {
    if (toProps.position !== fromProps.position) {
      this.leafletElement.setLatLng(toProps.position);
    }
    if (toProps.icon !== fromProps.icon) {
      this.leafletElement.setIcon(toProps.icon);
    }
    if (toProps.zIndexOffset !== fromProps.zIndexOffset) {
      this.leafletElement.setZIndexOffset(toProps.zIndexOffset);
    }
    if (toProps.opacity !== fromProps.opacity) {
      this.leafletElement.setOpacity(toProps.opacity);
    }
    if (toProps.draggable !== fromProps.draggable) {
      if (toProps.draggable === true) {
        this.leafletElement.dragging.enable();
      } else {
        this.leafletElement.dragging.disable();
      }
    }
  };

  return Marker;
}(MapLayer);

Marker.propTypes = {
  children: children,
  draggable: PropTypes.bool,
  icon: PropTypes.instanceOf(Icon),
  opacity: PropTypes.number,
  position: latlng.isRequired,
  zIndexOffset: PropTypes.number
};
Marker.childContextTypes = {
  popupContainer: layer
};
export default Marker;