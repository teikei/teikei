'use strict';

exports.__esModule = true;

var _leaflet = require('leaflet');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _GridLayer2 = require('./GridLayer');

var _GridLayer3 = _interopRequireDefault(_GridLayer2);

var _children = require('./propTypes/children');

var _children2 = _interopRequireDefault(_children);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

var TileLayer = function (_GridLayer) {
  _inherits(TileLayer, _GridLayer);

  function TileLayer() {
    _classCallCheck(this, TileLayer);

    return _possibleConstructorReturn(this, _GridLayer.apply(this, arguments));
  }

  TileLayer.prototype.createLeafletElement = function createLeafletElement(props) {
    return new _leaflet.TileLayer(props.url, this.getOptions(props));
  };

  TileLayer.prototype.updateLeafletElement = function updateLeafletElement(fromProps, toProps) {
    _GridLayer.prototype.updateLeafletElement.call(this, fromProps, toProps);
    if (toProps.url !== fromProps.url) {
      this.leafletElement.setUrl(toProps.url);
    }
  };

  return TileLayer;
}(_GridLayer3.default);

TileLayer.propTypes = {
  children: _children2.default,
  opacity: _propTypes2.default.number,
  url: _propTypes2.default.string.isRequired,
  zIndex: _propTypes2.default.number
};
exports.default = TileLayer;