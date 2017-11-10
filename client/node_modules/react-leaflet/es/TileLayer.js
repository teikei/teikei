function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

import { TileLayer as LeafletTileLayer } from 'leaflet';
import PropTypes from 'prop-types';

import GridLayer from './GridLayer';
import children from './propTypes/children';

var TileLayer = function (_GridLayer) {
  _inherits(TileLayer, _GridLayer);

  function TileLayer() {
    _classCallCheck(this, TileLayer);

    return _possibleConstructorReturn(this, _GridLayer.apply(this, arguments));
  }

  TileLayer.prototype.createLeafletElement = function createLeafletElement(props) {
    return new LeafletTileLayer(props.url, this.getOptions(props));
  };

  TileLayer.prototype.updateLeafletElement = function updateLeafletElement(fromProps, toProps) {
    _GridLayer.prototype.updateLeafletElement.call(this, fromProps, toProps);
    if (toProps.url !== fromProps.url) {
      this.leafletElement.setUrl(toProps.url);
    }
  };

  return TileLayer;
}(GridLayer);

TileLayer.propTypes = {
  children: children,
  opacity: PropTypes.number,
  url: PropTypes.string.isRequired,
  zIndex: PropTypes.number
};
export default TileLayer;