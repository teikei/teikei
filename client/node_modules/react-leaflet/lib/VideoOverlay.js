'use strict';

exports.__esModule = true;

var _leaflet = require('leaflet');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _MapLayer2 = require('./MapLayer');

var _MapLayer3 = _interopRequireDefault(_MapLayer2);

var _bounds = require('./propTypes/bounds');

var _bounds2 = _interopRequireDefault(_bounds);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

var VideoOverlay = function (_MapLayer) {
  _inherits(VideoOverlay, _MapLayer);

  function VideoOverlay() {
    _classCallCheck(this, VideoOverlay);

    return _possibleConstructorReturn(this, _MapLayer.apply(this, arguments));
  }

  VideoOverlay.prototype.createLeafletElement = function createLeafletElement(props) {
    return new _leaflet.VideoOverlay(props.url, props.bounds, this.getOptions(props));
  };

  VideoOverlay.prototype.componentDidMount = function componentDidMount() {
    _MapLayer.prototype.componentDidMount.call(this);
    if (this.props.play === true) {
      this.leafletElement.getElement().play();
    }
  };

  VideoOverlay.prototype.updateLeafletElement = function updateLeafletElement(fromProps, toProps) {
    if (toProps.url !== fromProps.url) {
      this.leafletElement.setUrl(toProps.url);
    }
    if (toProps.bounds !== fromProps.bounds) {
      this.leafletElement.setBounds((0, _leaflet.latLngBounds)(toProps.bounds));
    }
    if (toProps.opacity !== fromProps.opacity) {
      this.leafletElement.setOpacity(toProps.opacity);
    }
    if (toProps.zIndex !== fromProps.zIndex) {
      this.leafletElement.setZIndex(toProps.zIndex);
    }
    // flowlint-next-line sketchy-null-bool:off
    if (toProps.play === true && !fromProps.play) {
      this.leafletElement.getElement().play();
      // flowlint-next-line sketchy-null-bool:off
    } else if (!toProps.play && fromProps.play === true) {
      this.leafletElement.getElement().pause();
    }
  };

  return VideoOverlay;
}(_MapLayer3.default);

VideoOverlay.propTypes = {
  attribution: _propTypes2.default.string,
  bounds: _bounds2.default.isRequired,
  opacity: _propTypes2.default.number,
  play: _propTypes2.default.bool,
  url: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.arrayOf(_propTypes2.default.string), _propTypes2.default.instanceOf(HTMLVideoElement)]).isRequired,
  zIndex: _propTypes2.default.number
};
exports.default = VideoOverlay;