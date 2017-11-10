function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

import { LayerGroup as LeafletLayerGroup } from 'leaflet';

import MapLayer from './MapLayer';
import layerContainer from './propTypes/layerContainer';

var LayerGroup = function (_MapLayer) {
  _inherits(LayerGroup, _MapLayer);

  function LayerGroup() {
    _classCallCheck(this, LayerGroup);

    return _possibleConstructorReturn(this, _MapLayer.apply(this, arguments));
  }

  LayerGroup.prototype.getChildContext = function getChildContext() {
    return {
      layerContainer: this.leafletElement
    };
  };

  LayerGroup.prototype.createLeafletElement = function createLeafletElement() {
    return new LeafletLayerGroup(this.getOptions(this.props));
  };

  return LayerGroup;
}(MapLayer);

LayerGroup.childContextTypes = {
  layerContainer: layerContainer
};
export default LayerGroup;