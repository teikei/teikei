import _pick from 'lodash-es/pick';
import _isEqual from 'lodash-es/isEqual';

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

import MapLayer from './MapLayer';
import children from './propTypes/children';
import layer from './propTypes/layer';


var OPTIONS = ['stroke', 'color', 'weight', 'opacity', 'lineCap', 'lineJoin', 'dashArray', 'dashOffset', 'fill', 'fillColor', 'fillOpacity', 'fillRule', 'bubblingMouseEvents', 'renderer', 'className',
// Interactive Layer
'interactive',
// Layer
'pane', 'attribution'];

var Path = function (_MapLayer) {
  _inherits(Path, _MapLayer);

  function Path() {
    _classCallCheck(this, Path);

    return _possibleConstructorReturn(this, _MapLayer.apply(this, arguments));
  }

  Path.prototype.componentDidUpdate = function componentDidUpdate(prevProps) {
    _MapLayer.prototype.componentDidUpdate.call(this, prevProps);
    this.setStyleIfChanged(prevProps, this.props);
  };

  Path.prototype.getChildContext = function getChildContext() {
    return {
      popupContainer: this.leafletElement
    };
  };

  Path.prototype.getPathOptions = function getPathOptions(props) {
    return _pick(props, OPTIONS);
  };

  Path.prototype.setStyle = function setStyle() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    this.leafletElement.setStyle(options);
  };

  Path.prototype.setStyleIfChanged = function setStyleIfChanged(fromProps, toProps) {
    var nextStyle = this.getPathOptions(toProps);
    if (!_isEqual(nextStyle, this.getPathOptions(fromProps))) {
      this.setStyle(nextStyle);
    }
  };

  return Path;
}(MapLayer);

Path.childContextTypes = {
  children: children,
  popupContainer: layer
};
export default Path;