function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

import { FeatureGroup as LeafletFeatureGroup } from 'leaflet';

import Path from './Path';
import children from './propTypes/children';
import layer from './propTypes/layer';
import layerContainer from './propTypes/layerContainer';

var FeatureGroup = function (_Path) {
  _inherits(FeatureGroup, _Path);

  function FeatureGroup() {
    _classCallCheck(this, FeatureGroup);

    return _possibleConstructorReturn(this, _Path.apply(this, arguments));
  }

  FeatureGroup.prototype.getChildContext = function getChildContext() {
    return {
      layerContainer: this.leafletElement,
      popupContainer: this.leafletElement
    };
  };

  FeatureGroup.prototype.createLeafletElement = function createLeafletElement(props) {
    return new LeafletFeatureGroup(this.getOptions(props));
  };

  FeatureGroup.prototype.componentDidMount = function componentDidMount() {
    _Path.prototype.componentDidMount.call(this);
    this.setStyle(this.props);
  };

  return FeatureGroup;
}(Path);

FeatureGroup.childContextTypes = {
  children: children,
  layerContainer: layerContainer,
  popupContainer: layer
};
export default FeatureGroup;