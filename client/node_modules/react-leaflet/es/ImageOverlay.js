function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

import { ImageOverlay as LeafletImageOverlay, latLngBounds } from 'leaflet';
import PropTypes from 'prop-types';

import MapLayer from './MapLayer';
import bounds from './propTypes/bounds';
import children from './propTypes/children';
import layer from './propTypes/layer';

var ImageOverlay = function (_MapLayer) {
  _inherits(ImageOverlay, _MapLayer);

  function ImageOverlay() {
    _classCallCheck(this, ImageOverlay);

    return _possibleConstructorReturn(this, _MapLayer.apply(this, arguments));
  }

  ImageOverlay.prototype.getChildContext = function getChildContext() {
    return {
      popupContainer: this.leafletElement
    };
  };

  ImageOverlay.prototype.createLeafletElement = function createLeafletElement(props) {
    return new LeafletImageOverlay(props.url, props.bounds, this.getOptions(props));
  };

  ImageOverlay.prototype.updateLeafletElement = function updateLeafletElement(fromProps, toProps) {
    if (toProps.url !== fromProps.url) {
      this.leafletElement.setUrl(toProps.url);
    }
    if (toProps.bounds !== fromProps.bounds) {
      this.leafletElement.setBounds(latLngBounds(toProps.bounds));
    }
    if (toProps.opacity !== fromProps.opacity) {
      this.leafletElement.setOpacity(toProps.opacity);
    }
    if (toProps.zIndex !== fromProps.zIndex) {
      this.leafletElement.setZIndex(toProps.zIndex);
    }
  };

  return ImageOverlay;
}(MapLayer);

ImageOverlay.propTypes = {
  attribution: PropTypes.string,
  bounds: bounds.isRequired,
  children: children,
  opacity: PropTypes.number,
  url: PropTypes.string.isRequired,
  zIndex: PropTypes.number
};
ImageOverlay.childContextTypes = {
  popupContainer: layer
};
export default ImageOverlay;